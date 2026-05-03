from app.schemas.common import EvidenceLevel
from app.schemas.course import DocumentType


def classify_evidence_level(document_types: set[DocumentType]) -> EvidenceLevel:
    if DocumentType.PAST_PAPER in document_types or DocumentType.MARKING_SCHEME in document_types:
        return EvidenceLevel.HIGH
    if DocumentType.SYLLABUS in document_types and (
        DocumentType.SLIDES in document_types or DocumentType.NOTES in document_types
    ):
        return EvidenceLevel.MEDIUM
    return EvidenceLevel.LOW
