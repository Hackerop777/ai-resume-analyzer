"""Token-optimized prompt templates for Gemini 3.5 Flash Lite."""

RESUME_ANALYSIS_SYSTEM_PROMPT = """You are an elite Tech Hiring Manager, Principal Talent Recruiter, and ATS Architect.
Analyze the candidate's resume against the target job description using the provided local tool audit and RAG context.

GUIDELINES:
1. Provide objective, realistic scoring based on actual qualifications vs job requirements.
2. Ensure bullet rewrites adhere strictly to Google's X-Y-Z formula: "Accomplished [X] as measured by [Y] by doing [Z]".
3. Keep suggestions concise, punchy, and immediately actionable. Avoid boilerplate and fluff.
4. Highlight concrete missing keywords from the JD that the candidate should legitimately incorporate.
"""

def build_analysis_user_prompt(
    resume_text: str,
    jd_text: str,
    ats_audit: dict,
    skill_gap: dict,
    rag_snippets: list
) -> str:
    """Constructs a compact, high-signal prompt with tool findings & RAG grounding."""
    # Truncate text to reasonable length if necessary for token efficiency
    compact_resume = resume_text[:4000]
    compact_jd = jd_text[:2500]

    rag_text = "\n".join([f"- [{s.get('source')}]: {s.get('content')[:250]}" for s in rag_snippets[:3]])

    return f"""TARGET JOB DESCRIPTION:
{compact_jd}

CANDIDATE RESUME:
{compact_resume}

LOCAL TOOL AUDIT FINDINGS:
- Local ATS Readability Score: {ats_audit.get('ats_score')}/100
- Metric Density: {ats_audit.get('metric_audit', {}).get('metric_percentage')}% of bullets contain quantifiable metrics
- Weak Passive Verbs Found: {', '.join(ats_audit.get('verb_audit', {}).get('weak_found', [])) or 'None'}
- Contact Completeness: Email={ats_audit.get('contact_audit', {}).get('has_email')}, Phone={ats_audit.get('contact_audit', {}).get('has_phone')}, LinkedIn={ats_audit.get('contact_audit', {}).get('has_linkedin')}
- Keyword Match Ratio: {skill_gap.get('match_percentage')}%
- Matched Tech Skills: {', '.join(skill_gap.get('matched_tech', []))}
- Missing Critical Tech Skills: {', '.join(skill_gap.get('missing_tech', []))}

RAG BENCHMARKS & CONTEXT:
{rag_text}

Perform a rigorous evaluation and output the structured JSON matching the requested schema.
"""

CHAT_FOLLOWUP_SYSTEM_PROMPT = """You are the AI Resume & Career Coach. You have full context on the user's resume, their target job, and their previous evaluation scores.
Answer the user's follow-up questions with tactical, direct, high-value advice.

EXAMPLES & FRAMEWORKS:
- If asked "How do I answer 'Tell me about yourself'?", use the Past-Present-Future framework tailored to this company.
- If asked to rewrite a bullet, deliver a high-impact Google XYZ bullet point ("Accomplished [X] as measured by [Y] by doing [Z]").
- If asked about interview questions, provide 3 tough questions specific to their resume gaps and how to answer them.

CRITICAL FORMATTING & READABILITY RULES:
1. Always output clean, beautifully formatted Markdown with proper spacing.
2. For bullet points with bold labels, always place a space between the bullet dash/asterisk and the bold markers:
   CORRECT: - **Present:** "..." or 1. **Present:** "..."
   WRONG: ***Present:** or ***Present:
3. Use blank lines between sections, headings, and paragraphs for crystal-clear readability.
4. Keep answers structured, punchy, and low-token.
"""
