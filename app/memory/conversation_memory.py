import time
from typing import Dict, List, Any, Optional

class SessionMemory:
    """Manages short-term conversational memory with sliding-window token management."""

    def __init__(self, session_id: str):
        self.session_id = session_id
        self.created_at = time.time()
        self.candidate_summary: str = ""
        self.target_role: str = ""
        self.analysis_snapshot: Dict[str, Any] = {}
        self.messages: List[Dict[str, str]] = [] # [{"role": "user"|"agent", "content": "..."}]
        self.max_turns: int = 8 # Sliding window to guarantee low token usage

    def set_context(self, target_role: str, candidate_summary: str, analysis_snapshot: Dict[str, Any]):
        self.target_role = target_role
        self.candidate_summary = candidate_summary
        self.analysis_snapshot = analysis_snapshot

    def add_user_message(self, content: str):
        self.messages.append({"role": "user", "content": content})
        self._trim_messages()

    def add_agent_message(self, content: str):
        self.messages.append({"role": "agent", "content": content})
        self._trim_messages()

    def _trim_messages(self):
        """Keeps conversation within token budget by maintaining sliding window."""
        if len(self.messages) > self.max_turns * 2:
            self.messages = self.messages[-(self.max_turns * 2):]

    def get_chat_history(self) -> List[Dict[str, str]]:
        return self.messages

    def build_prompt_context(self) -> str:
        """Builds a compact context string for follow-up prompts."""
        ctx_parts = []
        if self.target_role:
            ctx_parts.append(f"Target Role/Company: {self.target_role}")
        if self.candidate_summary:
            ctx_parts.append(f"Candidate Profile: {self.candidate_summary}")
        
        scores = self.analysis_snapshot.get("scores", {})
        if scores:
            ctx_parts.append(
                f"Previous Scores -> Match: {scores.get('overall_score', 'N/A')}%, "
                f"Tech: {scores.get('technical_score', 'N/A')}%, "
                f"ATS: {scores.get('ats_score', 'N/A')}%"
            )

        missing_skills = self.analysis_snapshot.get("missing_skills", [])
        if missing_skills:
            ctx_parts.append(f"Key Missing Skills: {', '.join(missing_skills[:6])}")

        return "\n".join(ctx_parts)

class MemoryManager:
    """Singleton memory store for all active sessions."""
    _sessions: Dict[str, SessionMemory] = {}

    @classmethod
    def get_session(cls, session_id: str) -> SessionMemory:
        if session_id not in cls._sessions:
            cls._sessions[session_id] = SessionMemory(session_id)
        return cls._sessions[session_id]

    @classmethod
    def clear_session(cls, session_id: str):
        if session_id in cls._sessions:
            del cls._sessions[session_id]
