export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
  role: string;
  createdAt: string;
}

export interface Workspace {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  documentCount: number;
}

export interface PageContent {
  pageNumber: number;
  text: string;
}

export interface DocumentItem {
  id: string;
  workspaceId: string;
  name: string;
  size: number;
  pageCount: number;
  uploadedAt: string;
  status: "uploading" | "extracting" | "ready" | "failed";
  extractedText: string;
  pages: PageContent[];
  chunksCount: number;
}

export interface DocumentChunk {
  id: string;
  documentId: string;
  documentName: string;
  pageNumber: number;
  text: string;
  embedding?: number[];
  startChar?: number;
  endChar?: number;
}

export interface CitationItem {
  docName: string;
  page: number;
  excerpt?: string;
}

export interface ChatMessage {
  id: string;
  workspaceId: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  supportingEvidence?: CitationItem[];
  conflictingEvidence?: CitationItem[];
  limitations?: string;
  citations?: CitationItem[];
}

export type VerificationCategory =
  | "Supported"
  | "Contradicted"
  | "Partially Supported"
  | "Insufficient Evidence";

export interface ClaimVerification {
  id: string;
  workspaceId: string;
  claimText: string;
  category: VerificationCategory;
  explanation: string;
  supportingEvidence: CitationItem[];
  contradictingEvidence: CitationItem[];
  missingInformation: string;
  recommendedChecks: string[];
  timestamp: string;
}

export type ContradictionCategory =
  | "Numerical Mismatch"
  | "Date Discrepancy"
  | "Policy Conflict"
  | "Scope Conflict"
  | "Timeline Shift";

export type ContradictionStatus = "unreviewed" | "confirmed" | "dismissed" | "resolved";

export interface ContradictionFinding {
  id: string;
  workspaceId: string;
  title: string;
  category: ContradictionCategory;
  docA: { name: string; page: number; claim: string; excerpt: string };
  docB: { name: string; page: number; claim: string; excerpt: string };
  explanation: string;
  status: ContradictionStatus;
  notes?: string;
  detectedAt: string;
}

export interface ComparisonRow {
  category: string;
  aspect: string;
  docAValue: string;
  docBValue: string;
  status: "match" | "conflict" | "different_scope" | "missing";
  docAPage: number;
  docBPage: number;
}

export interface DocumentComparisonResult {
  id: string;
  workspaceId: string;
  docAName: string;
  docBName: string;
  rows: ComparisonRow[];
  summary: string;
}

export interface EvidenceReport {
  id: string;
  workspaceId: string;
  title: string;
  createdAt: string;
  analyzedDocs: string[];
  executiveSummary: string;
  keyFindings: string[];
  supportedClaims: ClaimVerification[];
  contradictions: ContradictionFinding[];
  unverifiedClaims: string[];
  limitations: string;
  recommendedNextSteps: string[];
}

export interface ActivityLog {
  id: string;
  workspaceId: string;
  action: string;
  details: string;
  timestamp: string;
  type: "upload" | "chat" | "verify" | "contradiction" | "report" | "workspace";
}

export interface GraphNode {
  id: string;
  label: string;
  type: "document" | "claim" | "evidence" | "contradiction";
  category?: string;
  sourceDoc?: string;
  page?: number;
  snippet?: string;
  x?: number;
  y?: number;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  relation: "supports" | "contradicts" | "references" | "related_to";
  label?: string;
}
