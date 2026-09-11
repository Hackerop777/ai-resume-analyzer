from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class MatchScores(BaseModel):
    overall_score: int = Field(description="Overall job match percentage between 0 and 100")
    technical_score: int = Field(description="Technical skills & tool alignment percentage (0-100)")
    experience_score: int = Field(description="Relevance and seniority of experience (0-100)")
    soft_skills_score: int = Field(description="Leadership, collaboration, and communication score (0-100)")
    ats_score: int = Field(description="ATS format and readability score (0-100)")
    score_rationale: str = Field(description="Concise 2-sentence summary explaining the overall score")

class SectionFeedback(BaseModel):
    section_name: str = Field(description="Name of the section (e.g., Summary, Experience, Skills, Education, Projects)")
    score: int = Field(description="Section quality score from 0 to 100")
    status: str = Field(description="'Strong', 'Moderate', or 'Needs Improvement'")
    strengths: List[str] = Field(description="Up to 2 key positive observations")
    weaknesses: List[str] = Field(description="Up to 2 key gaps or missed opportunities")
    recommended_fixes: List[str] = Field(description="1-2 concrete, concise improvements for this section")

class BulletRewrite(BaseModel):
    original_bullet: str = Field(description="The original weak bullet point from the resume")
    rewritten_bullet: str = Field(description="Improved version using Google's X-Y-Z formula: Accomplished [X] as measured by [Y] by doing [Z]")
    rationale: str = Field(description="Why this rewrite makes a stronger impact on recruiters")
    impact_type: str = Field(description="Type of improvement: 'Metrics', 'Action Verb', or 'Tech Specificity'")

class ActionableSuggestion(BaseModel):
    priority: str = Field(description="'HIGH', 'MEDIUM', or 'LOW'")
    category: str = Field(description="'Keywords', 'Quantifiable Impact', 'ATS Format', or 'Experience Framing'")
    title: str = Field(description="Catchy concise action title")
    description: str = Field(description="Specific explanation of what to improve")
    action_step: str = Field(description="Exact step candidate can execute immediately")

class LLMAnalysisOutput(BaseModel):
    candidate_name: str = Field(description="Detected candidate name or 'Candidate'")
    target_role: str = Field(description="Target role / position title")
    scores: MatchScores
    executive_summary: str = Field(description="High-impact 2-3 sentence overview of candidate match")
    sections_breakdown: List[SectionFeedback] = Field(description="Detailed breakdown for Summary, Experience, Skills, Education, Projects")
    bullet_rewrites: List[BulletRewrite] = Field(description="3-4 before and after high-impact bullet point rewrites")
    actionable_suggestions: List[ActionableSuggestion] = Field(description="Top 4-6 prioritized, actionable improvements")
    interview_strategy: str = Field(description="Advice on how to pitch this background and address any gaps in an interview")

class ChatRequest(BaseModel):
    session_id: str
    message: str
    parent_id: Optional[str] = None
    branch_history: Optional[List[Dict[str, Any]]] = None

class ChatResponse(BaseModel):
    session_id: str
    reply: str
    suggested_followups: List[str]
    latency_ms: int
    total_tokens: Optional[int] = 0

