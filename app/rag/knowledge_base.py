"""Industry hiring benchmarks and ATS standards used to ground RAG evaluation."""

KNOWLEDGE_BASE_DOCS = [
    {
        "id": "kb_xyz_formula",
        "title": "Google X-Y-Z Resume Bullet Formula",
        "content": (
            "Rule: Accomplished [X] as measured by [Y], by doing [Z]. "
            "Every bullet in work experience and key projects should start with a strong active verb, "
            "clearly state the measurable business or technical outcome (metrics, percentages, latency reduction, revenue, cost savings), "
            "and describe the specific technical tools or architecture used to achieve it. "
            "Avoid vague duties like 'worked on', 'assisted in', or 'responsible for'."
        )
    },
    {
        "id": "kb_ats_parsing_rules",
        "title": "ATS Parsing and Header Compliance",
        "content": (
            "Modern Applicant Tracking Systems (ATS) like Workday, Greenhouse, and Lever parse resumes sequentially. "
            "They look for standard headers: Professional Summary, Work Experience, Technical Skills, Education, Projects. "
            "Multi-column tables, graphics, text boxes, and unusual non-standard section titles often cause parse errors or dropped data. "
            "Bullet points should be single-tiered, concise (1-2 lines), and action-oriented."
        )
    },
    {
        "id": "kb_keyword_alignment",
        "title": "JD Keyword Density and Contextual Placement",
        "content": (
            "Recruiters and ATS match resumes against core job requirements. "
            "High-priority keywords must appear in both the Skills section AND contextually within the Work Experience bullet points. "
            "Simply listing a skill without showing how it was applied in a project or job reduces candidate credibility. "
            "Certifications and cloud platforms (AWS, GCP, Azure, K8s) should specify practical usage."
        )
    },
    {
        "id": "kb_interview_prep",
        "title": "Tell Me About Yourself and Behavioral Framing",
        "content": (
            "The 'Tell me about yourself' answer should follow the Past-Present-Future formula: "
            "1. Present: Current role, major domain expertise, and core strengths. "
            "2. Past: Formative background, key milestones, and notable high-scale impact achieved. "
            "3. Future: Why this specific target company and role are the exact next step where you can deliver immediate value. "
            "Keep the response to 90-120 seconds, emphasizing alignment with the target job's greatest pain point."
        )
    },
    {
        "id": "kb_quantifiable_metrics",
        "title": "Quantification of Engineering and Product Impact",
        "content": (
            "Quantifiable metrics distinguish top 5% candidates: "
            "Latency: Reduced API response times by X% or from Y ms to Z ms. "
            "Scale: Scaled system to handle X concurrent requests or Y million daily events. "
            "Reliability: Improved uptime to 99.9X%, reduced error rates by Y%. "
            "Cost & Efficiency: Decreased cloud infrastructure spend by $X / Y%, automated manual tasks saving Z engineering hours weekly."
        )
    }
]
