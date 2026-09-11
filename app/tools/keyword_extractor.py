import re
from typing import Dict, List, Set, Any

class KeywordExtractor:
    """Extracts and compares technical, domain, and soft skill keywords from resume and JD."""

    KNOWN_TECH_SKILLS = {
        # Programming Languages
        "python", "javascript", "typescript", "java", "c++", "c#", "golang", "go",
        "rust", "ruby", "php", "swift", "kotlin", "scala", "sql", "r", "bash",
        # Frameworks & Libraries
        "react", "react.js", "next.js", "vue", "vue.js", "angular", "node.js", "express",
        "fastapi", "flask", "django", "spring boot", "asp.net", "pytorch", "tensorflow",
        "scikit-learn", "pandas", "numpy", "keras", "tailwind", "graphql", "rest api",
        # Cloud & DevOps
        "aws", "azure", "gcp", "google cloud", "docker", "kubernetes", "k8s", "terraform",
        "ci/cd", "github actions", "jenkins", "ansible", "linux", "serverless", "lambda",
        # Databases & Big Data
        "postgresql", "postgres", "mysql", "mongodb", "redis", "elasticsearch", "kafka",
        "spark", "hadoop", "snowflake", "bigquery", "cassandra", "dynamodb", "chromadb",
        # AI / ML / LLM
        "rag", "langchain", "langgraph", "vector database", "embeddings", "gemini", "openai",
        "llm", "genai", "prompt engineering", "nlp", "computer vision", "fine-tuning",
        # Concepts & Practices
        "system design", "microservices", "agile", "scrum", "unit testing", "tdd", "git"
    }

    KNOWN_SOFT_SKILLS = {
        "leadership", "cross-functional", "communication", "stakeholder management",
        "problem solving", "mentorship", "collaboration", "strategic planning",
        "analytical thinking", "project management", "adaptability", "critical thinking"
    }

    @classmethod
    def extract_keywords_from_text(cls, text: str) -> Dict[str, Set[str]]:
        lower = text.lower()

        tech_found = set()
        for skill in cls.KNOWN_TECH_SKILLS:
            pattern = rf"\b{re.escape(skill)}\b"
            if re.search(pattern, lower):
                tech_found.add(skill)

        soft_found = set()
        for soft in cls.KNOWN_SOFT_SKILLS:
            pattern = rf"\b{re.escape(soft)}\b"
            if re.search(pattern, lower):
                soft_found.add(soft)

        return {
            "tech_skills": tech_found,
            "soft_skills": soft_found,
            "all_skills": tech_found.union(soft_found)
        }

    @classmethod
    def compare_skills(cls, resume_text: str, jd_text: str) -> Dict[str, Any]:
        res_kw = cls.extract_keywords_from_text(resume_text)
        jd_kw = cls.extract_keywords_from_text(jd_text)

        matched_tech = sorted(list(res_kw["tech_skills"].intersection(jd_kw["tech_skills"])))
        missing_tech = sorted(list(jd_kw["tech_skills"].difference(res_kw["tech_skills"])))
        extra_tech = sorted(list(res_kw["tech_skills"].difference(jd_kw["tech_skills"])))

        matched_soft = sorted(list(res_kw["soft_skills"].intersection(jd_kw["soft_skills"])))
        missing_soft = sorted(list(jd_kw["soft_skills"].difference(res_kw["soft_skills"])))

        total_jd = len(jd_kw["all_skills"])
        total_matched = len(matched_tech) + len(matched_soft)

        match_pct = int((total_matched / max(1, total_jd)) * 100) if total_jd > 0 else 80

        return {
            "match_percentage": match_pct,
            "matched_tech": matched_tech,
            "missing_tech": missing_tech,
            "extra_tech": extra_tech[:10],
            "matched_soft": matched_soft,
            "missing_soft": missing_soft,
            "total_jd_skills": total_jd,
            "total_matched_skills": total_matched
        }
