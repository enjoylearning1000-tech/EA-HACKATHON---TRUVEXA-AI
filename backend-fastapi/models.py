from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

class WorkspaceCreate(BaseModel):
    name: str
    description: Optional[str] = None

class WorkspaceResponse(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    created_at: str
    document_count: int = 0

class DocumentResponse(BaseModel):
    id: str
    workspace_id: str
    name: str
    file_size: int
    page_count: int
    status: str
    created_at: str
    chunks_count: int

class ChatRequest(BaseModel):
    workspace_id: str
    query: str
    target_document_id: Optional[str] = None

class CitationItem(BaseModel):
    doc_name: str
    page: int
    excerpt: Optional[str] = None

class ChatResponse(BaseModel):
    answer: str
    supporting_evidence: List[CitationItem] = []
    conflicting_evidence: List[CitationItem] = []
    limitations: Optional[str] = None
    citations: List[CitationItem] = []

class VerifyClaimRequest(BaseModel):
    workspace_id: str
    claim_text: str

class VerifyClaimResponse(BaseModel):
    id: str
    workspace_id: str
    claim_text: str
    category: str # Supported, Contradicted, Partially Supported, Insufficient Evidence
    explanation: str
    supporting_evidence: List[CitationItem] = []
    contradicting_evidence: List[CitationItem] = []
    missing_information: Optional[str] = None
    recommended_checks: List[str] = []
    timestamp: str

class ContradictionResponse(BaseModel):
    id: str
    workspace_id: str
    title: str
    category: str
    doc_a: Dict[str, Any]
    doc_b: Dict[str, Any]
    explanation: str
    status: str
    detected_at: str

class ReportGenerateRequest(BaseModel):
    workspace_id: str
    title: Optional[str] = None

class ReportResponse(BaseModel):
    id: str
    workspace_id: str
    title: str
    created_at: str
    analyzed_docs: List[str]
    executive_summary: str
    key_findings: List[str]
    limitations: str
    recommended_next_steps: List[str]
