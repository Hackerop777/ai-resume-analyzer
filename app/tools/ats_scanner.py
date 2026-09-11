import re
from typing import Dict, List, Any

class ATSScanner:
    """Fast, deterministic ATS audit engine. Runs locally in ~5ms consuming 0 tokens."""

    STRONG_ACTION_VERBS = {
        "spearheaded", "architected", "engineered", "orchestrated", "accelerated",
        "optimized", "delivered", "deployed", "scaled", "automated", "streamlined",
        "pioneered", "implemented", "developed", "designed", "reduced", "increased",
        "boosted", "generated", "mentored", "championed", "formulated", "established",
        "executed", "integrated", "revamped", "maximized", "transformed", "directed"
    }

    WEAK_PASSIVE_VERBS = {
        "assisted", "helped", "worked on", "responsible for", "participated in",
        "supported", "contributed to", "involved in", "handled", "aided", "tried"
    }

    EMAIL_REGEX = r"[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+"
    PHONE_REGEX = r"(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}"
    LINKEDIN_REGEX = r"(?:linkedin\.com\/in\/|linkedin:\s*\/?[a-zA-Z0-9_-]+)"
    GITHUB_REGEX = r"(?:github\.com\/|github:\s*\/?[a-zA-Z0-9_-]+)"

    @classmethod
    def audit_resume(cls, raw_text: str, sections: Dict[str, str], bullets: List[str]) -> Dict[str, Any]:
        contact_checks = cls._check_contact_info(raw_text)
        heading_checks = cls._check_headings(sections)
        metric_checks = cls._check_metric_density(bullets)
        verb_checks = cls._check_action_verbs(bullets)
        length_checks = cls._check_length_and_format(raw_text)

        # Compute deterministic ATS Friendliness subscore (0 to 100)
        ats_score = int(
            (contact_checks["score"] * 0.25) +
            (heading_checks["score"] * 0.25) +
            (metric_checks["score"] * 0.25) +
            (verb_checks["score"] * 0.15) +
            (length_checks["score"] * 0.10)
        )

        findings = []
        if not contact_checks["has_email"]:
            findings.append("Missing professional email address.")
        if not contact_checks["has_phone"]:
            findings.append("Missing phone number.")
        if not contact_checks["has_linkedin"]:
            findings.append("Missing LinkedIn profile URL.")
        if heading_checks["missing"]:
            findings.append(f"Missing standard ATS section headings: {', '.join(heading_checks['missing'])}.")
        if metric_checks["metric_percentage"] < 40:
            findings.append(f"Low metric density ({metric_checks['metric_percentage']}%). Aim for >50% of bullets to include numbers, %, or measurable outcomes.")
        if verb_checks["weak_found"]:
            findings.append(f"Found passive/weak phrases: {', '.join(verb_checks['weak_found'][:4])}. Replace with strong impact verbs.")

        return {
            "ats_score": ats_score,
            "contact_audit": contact_checks,
            "headings_audit": heading_checks,
            "metric_audit": metric_checks,
            "verb_audit": verb_checks,
            "length_audit": length_checks,
            "findings": findings
        }

    @classmethod
    def _check_contact_info(cls, text: str) -> Dict[str, Any]:
        has_email = bool(re.search(cls.EMAIL_REGEX, text))
        has_phone = bool(re.search(cls.PHONE_REGEX, text))
        has_linkedin = bool(re.search(cls.LINKEDIN_REGEX, text, re.IGNORECASE))
        has_github = bool(re.search(cls.GITHUB_REGEX, text, re.IGNORECASE))

        items = [has_email, has_phone, has_linkedin]
        score = int((sum(items) / len(items)) * 100)

        return {
            "score": score,
            "has_email": has_email,
            "has_phone": has_phone,
            "has_linkedin": has_linkedin,
            "has_github": has_github
        }

    @classmethod
    def _check_headings(cls, sections: Dict[str, str]) -> Dict[str, Any]:
        required = ["experience", "education", "skills"]
        found = [k for k in required if sections.get(k) and len(sections[k].strip()) > 10]
        missing = [k for k in required if k not in found]
        
        score = int((len(found) / len(required)) * 100)
        return {
            "score": score,
            "found": found,
            "missing": missing
        }

    @classmethod
    def _check_metric_density(cls, bullets: List[str]) -> Dict[str, Any]:
        if not bullets:
            return {"score": 50, "metric_percentage": 0, "bullets_with_metrics": 0, "total_bullets": 0}

        # Regex for numbers, percentages, multipliers, currency ($10k, 25%, 3x, 500ms, 1.2M)
        metric_regex = r"\b(?:\d+[\.,]?\d*|\$\d+[\.,]?\d*|\d+%(?:\.\d+)?|\d+x|\d+\s*(?:k|M|B|ms|sec|hours|days|users|engineers|team members|clients))\b"
        
        count = 0
        for b in bullets:
            if re.search(metric_regex, b, re.IGNORECASE):
                count += 1
        
        pct = int((count / len(bullets)) * 100)
        # Score scaled: 50% or above metrics gets 100 score
        score = min(100, int((pct / 50.0) * 100))
        return {
            "score": score,
            "metric_percentage": pct,
            "bullets_with_metrics": count,
            "total_bullets": len(bullets)
        }

    @classmethod
    def _check_action_verbs(cls, bullets: List[str]) -> Dict[str, Any]:
        strong_count = 0
        weak_found = set()

        for b in bullets:
            lower = b.lower().strip()
            first_words = " ".join(lower.split()[:3])
            
            for weak in cls.WEAK_PASSIVE_VERBS:
                if weak in first_words:
                    weak_found.add(weak)

            for strong in cls.STRONG_ACTION_VERBS:
                if strong in first_words:
                    strong_count += 1
                    break

        total = max(1, len(bullets))
        ratio = strong_count / total
        score = min(100, int(ratio * 120))
        if weak_found:
            score = max(20, score - (len(weak_found) * 10))

        return {
            "score": score,
            "strong_verb_count": strong_count,
            "weak_found": list(weak_found)
        }

    @classmethod
    def _check_length_and_format(cls, text: str) -> Dict[str, Any]:
        words = len(text.split())
        # Ideal resume length is roughly 400 to 1000 words (1-2 pages)
        if 350 <= words <= 1100:
            score = 100
            status = "Ideal length (1-2 pages)"
        elif words < 350:
            score = 65
            status = "Slightly brief; might lack detail on projects/achievements"
        else:
            score = 75
            status = "Lengthy; consider condensing to fit 1-2 pages"

        return {
            "score": score,
            "word_count": words,
            "status": status
        }
