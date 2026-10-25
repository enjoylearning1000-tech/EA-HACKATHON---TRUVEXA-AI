-- =========================================================================
-- TRUVEXA AI — DATABASE SCHEMA & PGVECTOR MIGRATION
-- Every Claim Deserves Evidence.
-- =========================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- 1. PROFILES (Extends Supabase Auth users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'analyst',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. WORKSPACES
CREATE TABLE IF NOT EXISTS workspaces (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. DOCUMENTS
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  storage_path TEXT,
  file_size BIGINT NOT NULL,
  page_count INT DEFAULT 1,
  status TEXT DEFAULT 'uploading', -- 'uploading', 'extracting', 'ready', 'failed'
  extracted_text TEXT,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. DOCUMENT_CHUNKS (With Vector Embeddings)
CREATE TABLE IF NOT EXISTS document_chunks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  page_number INT NOT NULL,
  chunk_index INT NOT NULL,
  content TEXT NOT NULL,
  embedding vector(1536), -- Compatible with OpenAI text-embedding-3 or Gemini embeddings
  start_char INT,
  end_char INT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chunks_doc_id ON document_chunks(document_id);
CREATE INDEX IF NOT EXISTS idx_chunks_embedding ON document_chunks USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- 5. PROCESSING_JOBS
CREATE TABLE IF NOT EXISTS processing_jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'queued', -- 'queued', 'extracting', 'embedding', 'completed', 'failed'
  progress_percent INT DEFAULT 0,
  error_log TEXT,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- 6. CONVERSATIONS
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  title TEXT DEFAULT 'Document Investigation',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. MESSAGES
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL, -- 'user', 'assistant'
  content TEXT NOT NULL,
  citations JSONB DEFAULT '[]'::jsonb,
  limitations TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. CLAIMS
CREATE TABLE IF NOT EXISTS claims (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  claim_text TEXT NOT NULL,
  category TEXT NOT NULL, -- 'Supported', 'Contradicted', 'Partially Supported', 'Insufficient Evidence'
  explanation TEXT NOT NULL,
  missing_information TEXT,
  recommended_checks JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. EVIDENCE_LINKS
CREATE TABLE IF NOT EXISTS evidence_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  claim_id UUID NOT NULL REFERENCES claims(id) ON DELETE CASCADE,
  chunk_id UUID REFERENCES document_chunks(id) ON DELETE SET NULL,
  document_name TEXT NOT NULL,
  page_number INT NOT NULL,
  excerpt TEXT NOT NULL,
  link_type TEXT NOT NULL, -- 'supporting', 'contradicting', 'reference'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. CONTRADICTIONS
CREATE TABLE IF NOT EXISTS contradictions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  category TEXT NOT NULL, -- 'Numerical Mismatch', 'Date Discrepancy', 'Policy Conflict', 'Scope Conflict', 'Timeline Shift'
  doc_a_name TEXT NOT NULL,
  doc_a_page INT NOT NULL,
  doc_a_claim TEXT NOT NULL,
  doc_a_excerpt TEXT NOT NULL,
  doc_b_name TEXT NOT NULL,
  doc_b_page INT NOT NULL,
  doc_b_claim TEXT NOT NULL,
  doc_b_excerpt TEXT NOT NULL,
  explanation TEXT NOT NULL,
  status TEXT DEFAULT 'unreviewed', -- 'unreviewed', 'confirmed', 'dismissed', 'resolved'
  review_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. REPORTS
CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  executive_summary TEXT NOT NULL,
  key_findings JSONB DEFAULT '[]'::jsonb,
  supported_claims_summary JSONB DEFAULT '[]'::jsonb,
  contradictions_summary JSONB DEFAULT '[]'::jsonb,
  limitations TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. ACTIVITY_LOGS
CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  details TEXT NOT NULL,
  activity_type TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =========================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =========================================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE evidence_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE contradictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Standard User Isolation Policies
CREATE POLICY "Users can manage own profile" ON profiles FOR ALL USING (auth.uid() = id);
CREATE POLICY "Users can manage own workspaces" ON workspaces FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage documents in their workspaces" ON documents FOR ALL USING (
  workspace_id IN (SELECT id FROM workspaces WHERE user_id = auth.uid())
);
