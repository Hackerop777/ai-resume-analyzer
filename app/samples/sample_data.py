"""Pre-packaged sample resumes and job descriptions for 1-click hackathon judging demos."""

SAMPLE_PROFILES = {
    "software_engineer": {
        "title": "Full-Stack Engineer vs Senior Backend / Cloud JD",
        "description": "Mid-level Full Stack dev applying for a Senior Cloud & Backend Engineer position at a high-growth fintech.",
        "resume": """ALEX CHEN
San Francisco, CA | alex.chen@email.com | (555) 382-9102 | linkedin.com/in/alexchen-dev | github.com/alexchen

PROFESSIONAL SUMMARY
Results-oriented Software Engineer with 4+ years of experience in full-stack web development. Experienced in building web services, REST APIs, and modern frontend interfaces. Passionate about system performance, database optimization, and cloud architecture.

TECHNICAL SKILLS
- Languages: Python, JavaScript, TypeScript, SQL, HTML, CSS
- Frameworks & Libraries: FastAPI, Flask, React, Node.js, Express, Tailwind CSS
- Databases & Storage: PostgreSQL, MySQL, Redis, MongoDB
- Cloud & Tools: AWS (EC2, S3), Docker, Git, Linux, Postman, Jest

WORK EXPERIENCE
Software Engineer | FinTech Cloud Corp | 2022 - Present
• Responsible for developing backend microservices for automated payment routing using FastAPI and PostgreSQL.
• Handled database queries optimization and added Redis caching layer for user session management.
• Helped migrate legacy monolithic checkout system to containerized Docker containers on AWS EC2.
• Assisted frontend team in creating modern responsive React components and dashboard analytics views.
• Collaborated with product managers and QA engineers in bi-weekly agile sprint meetings.

Junior Web Developer | InnovateTech Labs | 2020 - 2022
• Built interactive client-facing dashboards using React and Express.js, supporting 10,000 monthly active users.
• Wrote automated unit and integration tests with Jest, achieving 78% code coverage.
• Created RESTful API endpoints for customer onboarding, cutting verification latency from 800ms to 420ms.
• Participated in daily standups and weekly peer code reviews.

EDUCATION
Bachelor of Science in Computer Science
University of California, Davis | Graduated 2020

KEY PROJECTS
Distributed Task Queue (Open Source)
• Designed a lightweight asynchronous task queue in Python and Redis supporting delayed task execution and worker retries.
• Starred by 350+ developers on GitHub with 45 forks.
""",
        "job_description": """Position: Senior Backend & Cloud Engineer
Company: Apex FinTech Solutions
Location: Remote / San Francisco, CA

About the Role:
We are looking for a Senior Backend Engineer to architect, build, and scale our core payment orchestration platform. You will lead technical initiatives, design event-driven microservices, and optimize distributed cloud infrastructure handling over $500M in annual transactions.

Key Responsibilities:
- Architect, build, and maintain mission-critical, high-throughput microservices using Python (FastAPI/Django) or Go.
- Drive adoption of container orchestration with Kubernetes (K8s) and Infrastructure as Code using Terraform on AWS or GCP.
- Design high-performance distributed data architectures using PostgreSQL, Redis, Kafka, and DynamoDB.
- Champion CI/CD automation with GitHub Actions and implement observability using Prometheus and Datadog.
- Mentor mid-level and junior engineers, conduct thorough design reviews, and establish engineering best practices.

Requirements:
- 5+ years of production experience in backend software engineering with Python or Go.
- Strong hands-on experience with AWS, Docker, and Kubernetes (K8s) in high-scale production environments.
- Deep understanding of event-driven architectures, message queues (Kafka or RabbitMQ), and caching strategies (Redis).
- Proven track record of system design, reducing latency (p99 < 100ms), and high availability (99.99% uptime).
- Strong communication and cross-functional leadership skills.
""",
        "external_docs": """Apex FinTech Engineering Philosophy & Standards:
- We value extreme ownership and engineering metrics (DORA metrics: deployment frequency, lead time, MTTR).
- All candidates must demonstrate measurable business impact rather than just routine task execution.
- We strongly prioritize production Kubernetes, Kafka event streaming, and proactive observability.
- Candidates who lack Kafka or Kubernetes experience must show strong self-driven learning and solid system design fundamentals.
"""
    },
    "ai_ml_engineer": {
        "title": "Machine Learning Engineer vs Senior Generative AI Architect JD",
        "description": "ML practitioner applying for a Senior GenAI / LLM Systems Engineer role.",
        "resume": """PRIYA PATEL
Mumbai, India | priya.patel@email.com | 9876543211 | linkedin.com/in/priyapatel-ai | github.com/priyapatel

[SUMMARY]
AI/ML Engineering student with hands-on experience in building RAG pipelines, 
LLM integrations, and scalable backend APIs using Python and FastAPI.

[EDUCATION]
B.Tech in Computer Science
Thakur Ramnarayan College of Arts and Commerce, Mumbai
2022 - 2026 | CGPA: 9.2/10

[TECHNICAL SKILLS]
Languages: Python, C++, JavaScript, SQL
AI/ML: PyTorch, TensorFlow, LangChain, Hugging Face, RAG, ChromaDB, Gemini API
Backend: FastAPI, Node.js, Docker, Git

[EXPERIENCE]
AI Research Intern | XYZ AI Labs | June 2024 - Aug 2024
- Developed a RAG pipeline using LangChain and ChromaDB, reducing document retrieval latency by 35%.
- Fine-tuned a BERT model for sentiment analysis, achieving 92% F1-score on a dataset of 50k reviews.
- Collaborated with a team of 4 to deploy the model as a REST API using FastAPI and Docker.

[PROJECTS]
AI Resume Analyzer | Personal Project
- Built a visual DAG-based agent using Gemini API and FastAPI to score resumes against job descriptions.
- Implemented branch-specific memory isolation to prevent context contamination across different queries.
- Achieved sub-second response times with an average token consumption of 550 tokens per turn.

[ACHIEVEMENTS]
- Winner, Smart India Hackathon (College Level), 2025.
- Published a paper on "Efficient Fine-Tuning of LLMs" in the college journal.
""",
        "job_description": """Position: Senior Generative AI & LLM Systems Engineer
Company: Cognition Next AI

We are seeking a Senior GenAI Engineer to lead the architecture of enterprise-scale Agentic workflows, RAG systems, and multimodal LLM deployments.

Requirements:
- 4+ years in ML/AI engineering with deep expertise in LLM architectures, fine-tuning, and prompt optimization.
- Extensive production experience with Vector Databases (ChromaDB, Pinecone, Weaviate), RAG pipelines, and embeddings.
- Hands-on expertise with agentic frameworks: LangChain, LangGraph, or Google Agent Development Kit (ADK).
- Strong cloud engineering with AWS/GCP, Kubernetes, Docker, and FastAPI microservices.
- Experience with Gemini, Claude, or OpenAI APIs, structured JSON generation, and low-latency token streaming.
""",
        "external_docs": """Cognition Next Core Values:
- Focus on practical agent deployment, low-token cost architectures, and high recall in RAG evaluations.
- Fast execution and pragmatic engineering over theoretical academia.
"""
    }
}
