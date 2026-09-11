import re
import io
from typing import Dict, List, Any
import pypdf
import docx

class DocumentParser:
    """Extracts raw text and segments sections from resumes (PDF, DOCX, TXT)."""

    SECTION_HEADERS = {
        "contact": [r"contact", r"personal\s*info", r"contact\s*information", r"contact\s*details"],
        "summary": [r"summary", r"professional\s*summary", r"executive\s*summary", r"profile", r"about\s*me", r"objective", r"career\s*objective"],
        "experience": [
            r"experience", r"work\s*experience", r"professional\s*experience", r"employment\s*history",
            r"work\s*history", r"internships?", r"relevant\s*experience", r"practical\s*experience"
        ],
        "skills": [
            r"skills", r"technical\s*skills", r"core\s*competencies", r"technologies", r"skill\s*set",
            r"proficiencies", r"tools\s*and\s*technologies", r"tech\s*stack", r"technical\s*proficiencies"
        ],
        "education": [r"education", r"academic\s*background", r"qualifications", r"academic\s*history", r"educational\s*qualifications"],
        "projects": [r"projects", r"personal\s*projects", r"key\s*projects", r"portfolio", r"technical\s*projects", r"academic\s*projects"],
        "certifications": [r"certifications?", r"certificates?", r"licenses?", r"credentials?", r"courses?", r"achievements?", r"honors?", r"awards?"]
    }

    @staticmethod
    def parse_pdf(file_bytes: bytes) -> str:
        """Extract text cleanly from PDF bytes."""
        reader = pypdf.PdfReader(io.BytesIO(file_bytes))
        text_parts = []
        for page in reader.pages:
            t = page.extract_text()
            if t:
                text_parts.append(t)
        return "\n".join(text_parts)

    @staticmethod
    def parse_docx(file_bytes: bytes) -> str:
        """Extract text cleanly from DOCX bytes."""
        doc = docx.Document(io.BytesIO(file_bytes))
        text_parts = [para.text for para in doc.paragraphs if para.text.strip()]
        for table in doc.tables:
            for row in table.rows:
                row_text = " | ".join(cell.text.strip() for cell in row.cells if cell.text.strip())
                if row_text:
                    text_parts.append(row_text)
        return "\n".join(text_parts)

    @classmethod
    def parse_bytes(cls, file_bytes: bytes, filename: str) -> str:
        """Auto-detect format and parse bytes to text."""
        lower_name = filename.lower()
        if lower_name.endswith(".pdf"):
            return cls.parse_pdf(file_bytes)
        elif lower_name.endswith(".docx") or lower_name.endswith(".doc"):
            return cls.parse_docx(file_bytes)
        else:
            # Fallback to UTF-8 text
            try:
                return file_bytes.decode("utf-8")
            except UnicodeDecodeError:
                return file_bytes.decode("latin-1", errors="ignore")

    @classmethod
    def segment_sections(cls, raw_text: str) -> Dict[str, str]:
        """Segments raw resume text into distinct structural sections."""
        lines = [line.strip() for line in raw_text.splitlines() if line.strip()]
        sections: Dict[str, List[str]] = {
            "header": [],
            "summary": [],
            "experience": [],
            "skills": [],
            "education": [],
            "projects": [],
            "certifications": [],
            "other": []
        }

        current_section = "header"
        
        for line in lines:
            # Check if line looks like a section header (short line, matches regex)
            is_header = False
            words = line.split()
            if len(words) <= 5 and len(line) < 45:
                # Strip leading numbering like '1.', '1)', 'A.'
                clean_line = re.sub(r"^\d+[\.\)]\s*", "", line)
                # Strip all brackets, colons, dashes, symbols: [SUMMARY] -> summary
                clean_line = re.sub(r"[^\w\s]", "", clean_line).strip().lower()
                for section_name, patterns in cls.SECTION_HEADERS.items():
                    if any(re.fullmatch(p, clean_line) for p in patterns):
                        current_section = section_name
                        is_header = True
                        break
            
            if not is_header:
                sections[current_section].append(line)

        # Convert line lists to strings
        return {k: "\n".join(v).strip() for k, v in sections.items()}

    @staticmethod
    def extract_bullets(text: str) -> List[str]:
        """Extracts bullet points from text using common bullet markers and regex."""
        bullet_patterns = [
            r"^\s*[•\-\*\u2022\u2023\u25E6\u2043\u2219]\s*(.+)$",
            r"^\s*\d+[\.\)]\s*(.+)$"
        ]
        bullets = []
        for line in text.splitlines():
            line_str = line.strip()
            if not line_str:
                continue
            matched = False
            for p in bullet_patterns:
                m = re.match(p, line_str)
                if m:
                    bullets.append(m.group(1).strip())
                    matched = True
                    break
            if not matched and len(line_str) > 30 and (line_str.endswith(".") or line_str.endswith(";")):
                bullets.append(line_str)
        return bullets
