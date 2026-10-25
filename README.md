# TRUVEXA AI — Every Claim Deserves Evidence.

> **AI-Powered Document Intelligence & Cross-Document Evidence Verification Platform**  
> *Transform multi-document filings into trusted, auditable facts with zero hallucinations.*

---

## 🌟 Overview & Core Mission

People frequently rely on dense collections of documents (financial reports, audit filings, contracts, compliance frameworks) to make high-stakes decisions. These documents frequently contain **contradictory metrics**, **unsupported claims**, **revised figures**, and **timeline shifts** hidden across hundreds of pages.

**TRUVEXA AI** doesn't just summarize what a document says — it helps you determine **what the available evidence supports**, uncovering cross-document conflicts with line-level source citations.

---

## 🚀 Live Opening Experience

1. **Screen 1 — Animated Logo Splash Screen:** Deep navy gradient (`#071426` to `#0B1F38`), custom geometric evidence network logo, glowing cyan light reveal, subtle particle nodes, and smooth 2-second entrance.
2. **Screen 2 — Split-Screen Login & Registration:** Left panel deep navy branding and evidence network value proposition; right panel clean authentication with sign-in, account creation, and 1-Click Instant Demo Access for hackathon reviewers.
3. **Screen 3 — First-Time User Onboarding:** Step-by-step wizard to create an intelligence workspace, specify investigation scope, and pre-index test audit disclosures.
4. **Screen 4 — Main Intelligence Dashboard:** 12-section unified SaaS terminal with real data persistence, interactive evidence graph, and live citation jump to PDF viewer.

---

## 🧭 Investigation Suite (12 Core Sections)

| Section | Description |
| :--- | :--- |
| **1. Overview** | Real-time statistics, active workspace metrics, audit activity feed, and quick actions. |
| **2. My Workspaces** | Isolated investigation environments for different audits, contracts, and fiscal years. |
| **3. Upload Documents** | Multi-PDF upload (up to 10 files/batch) with client-side text extraction (`unpdf`), pagination, and chunk indexing. |
| **4. Document Library** | Searchable table of indexed filings with page counts, file sizes, chunk stats, and PDF viewer triggers. |
| **5. AI Research Assistant** | Source-grounded RAG assistant with supporting evidence, conflicting evidence, limitations, and clickable citations (`Doc.pdf — Page X`). |
| **6. Claim Verification** | Input factual statements to classify as **Supported**, **Contradicted**, **Partially Supported**, or **Insufficient Evidence**. |
| **7. Contradiction Explorer** | Core differentiator! Side-by-side comparison cards (Doc A vs Doc B) detailing revenue mismatches, budget escalations, and timeline shifts with review actions (`Mark Confirmed`, `Resolve`, `Dismiss`, `Add Note`). |
| **8. Document Comparison** | Side-by-side reconciliation matrix across key dimensions (Revenue, Budget, Target Release, Headcount, Retention). |
| **9. Evidence Graph** | Interactive topological visualization of documents, claims, chunks, and contradiction links with pan, zoom, and node inspector. |
| **10. Reports** | Compile official **TRUVEXA Evidence Intelligence Reports** with executive summary, findings, and export to **PDF/Print** and **CSV**. |
| **11. Analysis History** | Chronological audit trail of all queries, verifications, contradiction scans, and report compilations. |
| **12. Settings** | LLM API keys configuration (Google Gemini, OpenAI), Supabase connection testing, model selector, and cache resets. |

---

## 🛠️ Technology Stack

- **Frontend:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, Lucide React, Canvas Confetti.
- **Document Processing:** `unpdf` (zero-dependency pure JS/TS PDF extraction preserving page numbers).
- **Inference Engine:** Grounded Heuristic Engine (100% offline & zero-cost) + Google Gemini API & OpenAI API integration.
- **Database Architecture:** Local persistence store (`localStorage` + in-memory state) + Supabase PostgreSQL schema with `pgvector` and Row-Level Security (`supabase-schema.sql`).
- **Python Backend:** Standalone FastAPI microservice in `backend-fastapi/` with PyMuPDF text extractor and Dockerfile.

---

## 🚦 Quick Start (Local Run)

### Prerequisites
- Node.js `>= 20.0.0` (Verified on Node `v24.20.0`)
- npm `>= 10.0.0`

### 1. Run the Next.js Full-Stack Application
```bash
# Navigate to the project directory
cd "D:\Projects\truvexa-ai"

# Dependencies are already installed!
# Start the development server
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

### 2. Optional: Run the FastAPI Microservice
```bash
cd "D:\Projects\truvexa-ai\backend-fastapi"
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```
View API docs at: `http://localhost:8000/docs`

---

## 🧪 Automated Test Suite

TRUVEXA AI includes a 14-point test suite executing all mandatory verification scenarios:
```bash
node --test tests/truvexa.test.mjs
```

### Verified Test Results
```text
✔ 1. Authentication and Session persistence
✔ 2. Workspace isolation and management
✔ 3. PDF Chunking with preserved page coordinates
✔ 4. Semantic Retrieval and BM25 scoring
✔ 5. Evidence-backed QA synthesis with citations
✔ 6. Missing-evidence handling (Anti-hallucination guardrail)
✔ 7. Claim Verification: Supported claim classification
✔ 8. Claim Verification: Contradicted claim classification
✔ 9. Cross-Document Contradiction Engine (Revenue variance)
✔ 10. Cross-Document Contradiction Engine (Timeline variance)
✔ 11. Noncontradictory changes across consistent terms
✔ 12. Structured Evidence Report generation
✔ 13. User data and workspace deletion cascade
✔ 14. Logout and Session Clearing

Total: 14 passed, 0 failed (110ms)
```

---

## 🌐 Production Deployment Guide

### Deploying Frontend to Vercel
1. Push `D:\Projects\truvexa-ai` to GitHub.
2. Import project into [Vercel](https://vercel.com).
3. Set environment variables from `.env.example` (optional).
4. Click **Deploy**.

### Deploying Database to Supabase
1. Open your project on [Supabase](https://supabase.com).
2. Go to the **SQL Editor**.
3. Copy and run the entire SQL script from [`supabase-schema.sql`](./supabase-schema.sql).
4. Copy your project URL and anon public key into TRUVEXA Settings.

### Deploying Backend to Render
1. Create a Web Service on [Render](https://render.com) pointing to the `backend-fastapi` directory.
2. Render will automatically detect the `Dockerfile`.
3. Set environment variables (`GEMINI_API_KEY` or `OPENAI_API_KEY`).

---

## 📄 License & Attribution

Built for the AI Hackathon 2026.  
**TRUVEXA AI** — *Every Claim Deserves Evidence.*
