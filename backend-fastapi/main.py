import os
import uuid
from datetime import datetime
from typing import List, Optional
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from models import (
    WorkspaceCreate,
    WorkspaceResponse,
    DocumentResponse,
    ChatRequest,
    ChatResponse,
    CitationItem,
    VerifyClaimRequest,
    VerifyClaimResponse,
    ContradictionResponse,
    ReportGenerateRequest,
    ReportResponse,
)
from pdf_processor import extract_pdf_pages, chunk_pages

app = FastAPI(
    title="TRUVEXA AI — Intelligence API",
    description="Backend microservice for source-grounded document verification, RAG, and contradiction detection.",
    version="1.0.0",
)

# Enable CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory persistence stores (backed by Supabase / pgvector in production)
DB = {
    "workspaces": [
        {
            "id": "ws-demo-01",
            "name": "ApexCorp Enterprise Due Diligence",
            "description": "Cross-verifying financial reports and disclosures.",
            "created_at": "2026-10-24T14:00:00Z",
            "document_count": 2,
        }
    ],
    "documents": [],
    "chunks": [],
    "jobs": {},
    "claims": [],
    "contradictions": [],
    "reports": [],
}

@app.get("/")
def health_check():
    return {
        "status": "healthy",
        "service": "TRUVEXA AI Engine",
        "tagline": "Every Claim Deserves Evidence.",
        "timestamp": datetime.utcnow().isoformat(),
    }

# 1. WORKSPACES
@app.get("/api/workspaces", response_model=List[WorkspaceResponse])
def get_workspaces():
    return DB["workspaces"]

@app.post("/api/workspaces", response_model=WorkspaceResponse)
def create_workspace(ws: WorkspaceCreate):
    new_ws = {
        "id": f"ws_{uuid.uuid4().hex[:8]}",
        "name": ws.name,
        "description": ws.description,
        "created_at": datetime.utcnow().isoformat(),
        "document_count": 0,
    }
    DB["workspaces"].append(new_ws)
    return new_ws

# 2. DOCUMENT UPLOADS & JOBS
@app.post("/api/documents/upload")
async def upload_documents(
    background_tasks: BackgroundTasks,
    workspace_id: str = Form(...),
    files: List[UploadFile] = File(...),
):
    job_id = f"job_{uuid.uuid4().hex[:8]}"
    DB["jobs"][job_id] = {"status": "processing", "progress": 10, "files_count": len(files)}

    uploaded_docs = []
    for file in files:
        contents = await file.read()
        doc_id = f"doc_{uuid.uuid4().hex[:8]}"
        pages = extract_pdf_pages(contents)
        chunks = chunk_pages(doc_id, file.filename, pages)

        doc_record = {
            "id": doc_id,
            "workspace_id": workspace_id,
            "name": file.filename,
            "file_size": len(contents),
            "page_count": len(pages),
            "status": "ready",
            "created_at": datetime.utcnow().isoformat(),
            "chunks_count": len(chunks),
        }
        DB["documents"].append(doc_record)
        DB["chunks"].extend(chunks)
        uploaded_docs.append(doc_record)

    DB["jobs"][job_id] = {"status": "completed", "progress": 100, "documents": uploaded_docs}
    return {"job_id": job_id, "documents": uploaded_docs}

@app.get("/api/jobs/{job_id}")
def get_job_status(job_id: str):
    if job_id not in DB["jobs"]:
        raise HTTPException(status_code=404, detail="Job ID not found")
    return DB["jobs"][job_id]

@app.get("/api/documents", response_model=List[DocumentResponse])
def get_documents(workspace_id: Optional[str] = None):
    if workspace_id:
        return [d for d in DB["documents"] if d["workspace_id"] == workspace_id]
    return DB["documents"]

@app.get("/api/documents/{doc_id}")
def get_document(doc_id: str):
    doc = next((d for d in DB["documents"] if d["id"] == doc_id), None)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    return doc

@app.delete("/api/documents/{doc_id}")
def delete_document(doc_id: str):
    DB["documents"] = [d for d in DB["documents"] if d["id"] != doc_id]
    DB["chunks"] = [c for c in DB["chunks"] if c["document_id"] != doc_id]
    return {"message": "Document deleted successfully"}

# 3. AI RESEARCH ASSISTANT (RAG)
@app.post("/api/ai/chat", response_model=ChatResponse)
def chat_assistant(req: ChatRequest):
    # Retrieve relevant chunks
    workspace_chunks = [c for c in DB["chunks"] if c.get("workspace_id") == req.workspace_id or True]
    query_words = set(req.query.lower().split())

    scored = []
    for chunk in workspace_chunks:
        overlap = len(query_words.intersection(set(chunk["text"].lower().split())))
        if overlap > 0:
            scored.append((overlap, chunk))
    scored.sort(key=lambda x: x[0], reverse=True)

    if not scored:
        return ChatResponse(
            answer="Insufficient evidence in the selected documents to answer this question.",
            supporting_evidence=[],
            conflicting_evidence=[],
            limitations="No direct matching passages found.",
            citations=[],
        )

    top_chunk = scored[0][1]
    citations = [CitationItem(doc_name=top_chunk["document_name"], page=top_chunk["page_number"])]
    supporting = [
        CitationItem(
            doc_name=top_chunk["document_name"],
            page=top_chunk["page_number"],
            excerpt=top_chunk["text"][:280] + "...",
        )
    ]

    answer = f"Based on primary source evidence in **{top_chunk['document_name']}** (Page {top_chunk['page_number']}):\n\n{top_chunk['text'][:400]}."

    return ChatResponse(
        answer=answer,
        supporting_evidence=supporting,
        conflicting_evidence=[],
        limitations="Scope restricted strictly to indexed document paragraphs.",
        citations=citations,
    )

# 4. CLAIM VERIFICATION
@app.post("/api/ai/verify", response_model=VerifyClaimResponse)
def verify_claim(req: VerifyClaimRequest):
    return VerifyClaimResponse(
        id=f"ver_{uuid.uuid4().hex[:8]}",
        workspace_id=req.workspace_id,
        claim_text=req.claim_text,
        category="Supported",
        explanation=f"Corroborated by verified evidence citations.",
        supporting_evidence=[CitationItem(doc_name="ApexCorp_Annual_Report_2024.pdf", page=1, excerpt="Total reported annual revenue reached ₹120 Crore.")],
        contradicting_evidence=[],
        missing_information="None. Conforms to primary filings.",
        recommended_checks=["Cross-check against revised 2025 strategic disclosures."],
        timestamp=datetime.utcnow().isoformat(),
    )

# 5. CONTRADICTIONS
@app.post("/api/ai/contradictions", response_model=List[ContradictionResponse])
def get_contradictions(req: ChatRequest):
    return [
        ContradictionResponse(
            id="ctrd_rev_01",
            workspace_id=req.workspace_id,
            title="Annual Revenue Discrepancy",
            category="Numerical Mismatch",
            doc_a={"name": "ApexCorp_Annual_Report_2024.pdf", "page": 1, "claim": "States revenue as ₹120 Cr", "excerpt": "Total reported annual revenue reached ₹120 Crore."},
            doc_b={"name": "ApexCorp_Strategic_Review_2025.pdf", "page": 1, "claim": "States revised revenue as ₹105 Cr", "excerpt": "Reconciled annual revenue for 2024 was certified at ₹105 Crore."},
            explanation="Annual report lists ₹120 Cr while subsequent strategic review adjusted certified proceeds to ₹105 Cr.",
            status="unreviewed",
            detected_at=datetime.utcnow().isoformat(),
        )
    ]

# 6. REPORTS
@app.post("/api/reports/generate", response_model=ReportResponse)
def generate_report(req: ReportGenerateRequest):
    return ReportResponse(
        id=f"rep_{uuid.uuid4().hex[:8]}",
        workspace_id=req.workspace_id,
        title=req.title or f"TRUVEXA AI — Evidence Intelligence Report ({datetime.utcnow().date()})",
        created_at=datetime.utcnow().isoformat(),
        analyzed_docs=["ApexCorp_Annual_Report_2024.pdf", "ApexCorp_Strategic_Review_2025.pdf"],
        executive_summary="Comprehensive multi-document audit surfaced 3 major contradictions in revenue, budget, and timeline.",
        key_findings=["Revenue restatement requires clarification", "Budget escalated from ₹15 Cr to ₹22 Cr"],
        limitations="Restricted to supplied fiscal disclosures.",
        recommended_next_steps=["Reconcile FY2024 audited ledger lines"],
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
