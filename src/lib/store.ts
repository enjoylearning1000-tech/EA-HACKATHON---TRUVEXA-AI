import {
  UserProfile,
  Workspace,
  DocumentItem,
  DocumentChunk,
  ChatMessage,
  ClaimVerification,
  ContradictionFinding,
  EvidenceReport,
  ActivityLog,
} from "@/types";
import { DEFAULT_WORKSPACE, SAMPLE_DOCUMENTS, INITIAL_CHUNKS } from "./sampleData";
import { executeContradictionScan } from "./intelligence";

const STORAGE_KEYS = {
  USER: "truvexa_user",
  WORKSPACES: "truvexa_workspaces",
  ACTIVE_WS: "truvexa_active_workspace_id",
  DOCUMENTS: "truvexa_documents",
  CHUNKS: "truvexa_chunks",
  MESSAGES: "truvexa_messages",
  VERIFICATIONS: "truvexa_verifications",
  CONTRADICTIONS: "truvexa_contradictions",
  REPORTS: "truvexa_reports",
  ACTIVITIES: "truvexa_activities",
  SETTINGS: "truvexa_settings",
};

export interface AppSettings {
  geminiApiKey: string;
  openaiApiKey: string;
  supabaseUrl: string;
  supabaseAnonKey: string;
  preferredModel: string;
  theme: "dark" | "navy" | "light";
}

const DEFAULT_SETTINGS: AppSettings = {
  geminiApiKey: "",
  openaiApiKey: "",
  supabaseUrl: "",
  supabaseAnonKey: "",
  preferredModel: "local-heuristic",
  theme: "navy",
};

// Safe Local Storage Get
function getLocalItem<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    console.error(`Error reading ${key} from localStorage:`, e);
    return fallback;
  }
}

// Safe Local Storage Set
function setLocalItem<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Error writing ${key} to localStorage:`, e);
  }
}

export class TruvexaStore {
  // Session & User
  static getUser(): UserProfile | null {
    return getLocalItem<UserProfile | null>(STORAGE_KEYS.USER, null);
  }

  static setUser(user: UserProfile | null): void {
    setLocalItem(STORAGE_KEYS.USER, user);
  }

  static logout(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEYS.USER);
    }
  }

  // Workspaces
  static getWorkspaces(): Workspace[] {
    const saved = getLocalItem<Workspace[]>(STORAGE_KEYS.WORKSPACES, []);
    if (saved.length === 0) {
      this.setWorkspaces([DEFAULT_WORKSPACE]);
      return [DEFAULT_WORKSPACE];
    }
    return saved;
  }

  static setWorkspaces(workspaces: Workspace[]): void {
    setLocalItem(STORAGE_KEYS.WORKSPACES, workspaces);
  }

  static getActiveWorkspaceId(): string {
    return getLocalItem<string>(STORAGE_KEYS.ACTIVE_WS, DEFAULT_WORKSPACE.id);
  }

  static setActiveWorkspaceId(id: string): void {
    setLocalItem(STORAGE_KEYS.ACTIVE_WS, id);
  }

  // Documents
  static getDocuments(workspaceId?: string): DocumentItem[] {
    const all = getLocalItem<DocumentItem[]>(STORAGE_KEYS.DOCUMENTS, []);
    if (all.length === 0) {
      this.setDocuments(SAMPLE_DOCUMENTS);
      return workspaceId ? SAMPLE_DOCUMENTS.filter((d) => d.workspaceId === workspaceId) : SAMPLE_DOCUMENTS;
    }
    return workspaceId ? all.filter((d) => d.workspaceId === workspaceId) : all;
  }

  static setDocuments(docs: DocumentItem[]): void {
    setLocalItem(STORAGE_KEYS.DOCUMENTS, docs);
  }

  static addDocument(doc: DocumentItem): void {
    const current = this.getDocuments();
    this.setDocuments([...current.filter((d) => d.id !== doc.id), doc]);
  }

  static deleteDocument(id: string): void {
    const current = this.getDocuments();
    this.setDocuments(current.filter((d) => d.id !== id));
    // Also delete associated chunks
    const chunks = this.getChunks().filter((c) => c.documentId !== id);
    this.setChunks(chunks);
  }

  // Chunks
  static getChunks(workspaceId?: string): DocumentChunk[] {
    const all = getLocalItem<DocumentChunk[]>(STORAGE_KEYS.CHUNKS, []);
    if (all.length === 0) {
      this.setChunks(INITIAL_CHUNKS);
      return INITIAL_CHUNKS;
    }
    return all;
  }

  static setChunks(chunks: DocumentChunk[]): void {
    setLocalItem(STORAGE_KEYS.CHUNKS, chunks);
  }

  static addChunks(newChunks: DocumentChunk[]): void {
    const current = this.getChunks();
    this.setChunks([...current, ...newChunks]);
  }

  // Chat Messages
  static getMessages(workspaceId: string): ChatMessage[] {
    const all = getLocalItem<ChatMessage[]>(STORAGE_KEYS.MESSAGES, []);
    const filtered = all.filter((m) => m.workspaceId === workspaceId);
    if (filtered.length === 0) {
      const defaultIntro: ChatMessage = {
        id: "msg-intro-01",
        workspaceId,
        role: "assistant",
        content:
          "Welcome to TRUVEXA AI. I am your source-grounded research assistant. Ask any question about your indexed documents, and every answer will be substantiated with direct page citations and evidence limitations.",
        timestamp: new Date().toISOString(),
      };
      this.addMessage(defaultIntro);
      return [defaultIntro];
    }
    return filtered;
  }

  static addMessage(msg: ChatMessage): void {
    const current = getLocalItem<ChatMessage[]>(STORAGE_KEYS.MESSAGES, []);
    setLocalItem(STORAGE_KEYS.MESSAGES, [...current, msg]);
  }

  // Claim Verifications
  static getVerifications(workspaceId: string): ClaimVerification[] {
    const all = getLocalItem<ClaimVerification[]>(STORAGE_KEYS.VERIFICATIONS, []);
    return all.filter((v) => v.workspaceId === workspaceId);
  }

  static addVerification(v: ClaimVerification): void {
    const current = getLocalItem<ClaimVerification[]>(STORAGE_KEYS.VERIFICATIONS, []);
    setLocalItem(STORAGE_KEYS.VERIFICATIONS, [v, ...current]);
  }

  // Contradictions
  static getContradictions(workspaceId: string): ContradictionFinding[] {
    const all = getLocalItem<ContradictionFinding[]>(STORAGE_KEYS.CONTRADICTIONS, []);
    const filtered = all.filter((c) => c.workspaceId === workspaceId);
    if (filtered.length === 0) {
      // Auto-scan initial sample docs if matching default workspace
      const docs = this.getDocuments(workspaceId);
      const chunks = this.getChunks(workspaceId);
      const initial = executeContradictionScan(docs, chunks, workspaceId);
      if (initial.length > 0) {
        setLocalItem(STORAGE_KEYS.CONTRADICTIONS, initial);
        return initial;
      }
    }
    return filtered;
  }

  static setContradictions(list: ContradictionFinding[]): void {
    setLocalItem(STORAGE_KEYS.CONTRADICTIONS, list);
  }

  static updateContradictionStatus(
    id: string,
    status: ContradictionFinding["status"],
    notes?: string
  ): void {
    const all = getLocalItem<ContradictionFinding[]>(STORAGE_KEYS.CONTRADICTIONS, []);
    const updated = all.map((c) => (c.id === id ? { ...c, status, notes: notes ?? c.notes } : c));
    setLocalItem(STORAGE_KEYS.CONTRADICTIONS, updated);
  }

  // Reports
  static getReports(workspaceId: string): EvidenceReport[] {
    const all = getLocalItem<EvidenceReport[]>(STORAGE_KEYS.REPORTS, []);
    return all.filter((r) => r.workspaceId === workspaceId);
  }

  static addReport(r: EvidenceReport): void {
    const current = getLocalItem<EvidenceReport[]>(STORAGE_KEYS.REPORTS, []);
    setLocalItem(STORAGE_KEYS.REPORTS, [r, ...current]);
  }

  // Activity Logs
  static getActivities(workspaceId: string): ActivityLog[] {
    const all = getLocalItem<ActivityLog[]>(STORAGE_KEYS.ACTIVITIES, []);
    const filtered = all.filter((a) => a.workspaceId === workspaceId);
    if (filtered.length === 0) {
      const defaultLogs: ActivityLog[] = [
        {
          id: "act-1",
          workspaceId,
          action: "Workspace Initialized",
          details: "Created workspace 'ApexCorp Enterprise Due Diligence'",
          timestamp: "2026-10-24T14:00:00Z",
          type: "workspace",
        },
        {
          id: "act-2",
          workspaceId,
          action: "Documents Indexed",
          details: "Processed 2 PDFs and indexed 6 evidence chunks",
          timestamp: "2026-10-24T14:30:00Z",
          type: "upload",
        },
        {
          id: "act-3",
          workspaceId,
          action: "Contradiction Flagged",
          details: "Detected revenue variance (₹120 Cr vs ₹105 Cr) between Annual Report & Strategic Review",
          timestamp: "2026-10-24T15:00:00Z",
          type: "contradiction",
        },
      ];
      setLocalItem(STORAGE_KEYS.ACTIVITIES, defaultLogs);
      return defaultLogs;
    }
    return filtered;
  }

  static logActivity(log: Omit<ActivityLog, "id" | "timestamp">): void {
    const current = getLocalItem<ActivityLog[]>(STORAGE_KEYS.ACTIVITIES, []);
    const newLog: ActivityLog = {
      ...log,
      id: `act_${Date.now()}`,
      timestamp: new Date().toISOString(),
    };
    setLocalItem(STORAGE_KEYS.ACTIVITIES, [newLog, ...current]);
  }

  // Settings
  static getSettings(): AppSettings {
    return getLocalItem<AppSettings>(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
  }

  static setSettings(settings: AppSettings): void {
    setLocalItem(STORAGE_KEYS.SETTINGS, settings);
  }
}
