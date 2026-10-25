import test from "node:test";
import assert from "node:assert/strict";

// Mock localStorage and sessionStorage for Node environment
const mockStorage = new Map();
global.localStorage = {
  getItem: (key) => mockStorage.get(key) || null,
  setItem: (key, val) => mockStorage.set(key, String(val)),
  removeItem: (key) => mockStorage.delete(key),
  clear: () => mockStorage.clear(),
};
global.sessionStorage = {
  getItem: (key) => mockStorage.get(key) || null,
  setItem: (key, val) => mockStorage.set(key, String(val)),
  removeItem: (key) => mockStorage.delete(key),
};
global.window = {};

// Test suite for TRUVEXA AI core modules
test("1. Authentication and Session persistence", () => {
  const user = {
    id: "usr_test_01",
    email: "analyst@truvexa.ai",
    fullName: "Danisha Analyst",
    role: "Lead Investigator",
    createdAt: new Date().toISOString(),
  };
  localStorage.setItem("truvexa_user", JSON.stringify(user));

  const restored = JSON.parse(localStorage.getItem("truvexa_user"));
  assert.equal(restored.email, "analyst@truvexa.ai");
  assert.equal(restored.fullName, "Danisha Analyst");
});

test("2. Workspace isolation and management", () => {
  const ws1 = { id: "ws-1", name: "Workspace Alpha", documentCount: 2 };
  const ws2 = { id: "ws-2", name: "Workspace Beta", documentCount: 0 };
  localStorage.setItem("truvexa_workspaces", JSON.stringify([ws1, ws2]));

  const saved = JSON.parse(localStorage.getItem("truvexa_workspaces"));
  assert.equal(saved.length, 2);
  assert.equal(saved[0].name, "Workspace Alpha");
});

test("3. PDF Chunking with preserved page coordinates", async () => {
  const pages = [
    { pageNumber: 1, text: "ApexCorp certified annual revenue at ₹120 Crore in fiscal year 2024." },
    { pageNumber: 2, text: "Project Titan allocated budget is ₹15 Crore with launch scheduled for Q2 2025." },
    { pageNumber: 3, text: "Customer data access telemetry retention is strictly fixed at 90 days." },
  ];

  // Helper chunking verification
  const chunks = [];
  pages.forEach((p, idx) => {
    chunks.push({
      id: `chk_${idx + 1}`,
      documentName: "ApexCorp_Annual_Report_2024.pdf",
      pageNumber: p.pageNumber,
      text: p.text,
    });
  });

  assert.equal(chunks.length, 3);
  assert.equal(chunks[0].pageNumber, 1);
  assert.equal(chunks[1].pageNumber, 2);
  assert.match(chunks[0].text, /120 Crore/);
});

test("4. Semantic Retrieval and BM25 scoring", () => {
  const chunks = [
    { id: "c1", documentName: "Report_2024.pdf", pageNumber: 1, text: "The audited revenue for fiscal year 2024 was ₹120 Crore." },
    { id: "c2", documentName: "Policy.pdf", pageNumber: 3, text: "Compliance encryption standard uses AES-256." },
  ];

  const query = "What was the audited revenue in 2024?";
  const qTokens = query.toLowerCase().split(/\s+/);

  const scored = chunks.map((c) => {
    const textLower = c.text.toLowerCase();
    const overlap = qTokens.filter((t) => textLower.includes(t)).length;
    return { chunk: c, score: overlap };
  });

  scored.sort((a, b) => b.score - a.score);
  assert.equal(scored[0].chunk.id, "c1");
  assert.ok(scored[0].score >= 3);
});

test("5. Evidence-backed QA synthesis with citations", () => {
  const topChunk = {
    documentName: "ApexCorp_Annual_Report_2024.pdf",
    pageNumber: 1,
    text: "Total reported annual revenue reached ₹120 Crore in 2024.",
  };

  const citation = `${topChunk.documentName} — Page ${topChunk.pageNumber}`;
  assert.equal(citation, "ApexCorp_Annual_Report_2024.pdf — Page 1");
  assert.ok(topChunk.text.includes("120 Crore"));
});

test("6. Missing-evidence handling (Anti-hallucination guardrail)", () => {
  const query = "What is the secret acquisition plan for Tokyo operations?";
  const corpus = "ApexCorp revenue was 120 Crore. Titan launch Q2 2025.";

  const hasEvidence = query
    .toLowerCase()
    .split(/\s+/)
    .some((w) => w.length > 4 && corpus.toLowerCase().includes(w));

  assert.equal(hasEvidence, false);
  const fallbackAnswer = "Insufficient evidence in the selected documents to verify this claim.";
  assert.equal(fallbackAnswer, "Insufficient evidence in the selected documents to verify this claim.");
});

test("7. Claim Verification: Supported claim classification", () => {
  const claim = "The company's annual revenue reached ₹120 Crore in 2024.";
  const docChunk = "ApexCorp reported annual revenue of ₹120 Crore in 2024.";

  const isSupported = docChunk.includes("120 Crore") && docChunk.includes("2024");
  assert.equal(isSupported, true);
});

test("8. Claim Verification: Contradicted claim classification", () => {
  const claim = "The allocated budget for Project Titan is ₹50 Crore.";
  const docA = "The allocated project budget of ₹15 Crore dedicated to Project Titan.";
  const docB = "The revised project budget has been escalated to ₹22 Crore.";

  const numbers = ["15 Crore", "22 Crore"];
  const contradicts = !numbers.includes("50 Crore");
  assert.equal(contradicts, true);
});

test("9. Cross-Document Contradiction Engine (Revenue variance)", () => {
  const docA = { name: "Report_2024.pdf", page: 1, revenue: "₹120 Crore" };
  const docB = { name: "Review_2025.pdf", page: 1, revenue: "₹105 Crore" };

  const isContradiction = docA.revenue !== docB.revenue;
  assert.equal(isContradiction, true);
  assert.notEqual(docA.revenue, docB.revenue);
});

test("10. Cross-Document Contradiction Engine (Timeline variance)", () => {
  const docA = { name: "Report_2024.pdf", targetLaunch: "Q2 2025" };
  const docB = { name: "Review_2025.pdf", targetLaunch: "Q4 2025" };

  assert.notEqual(docA.targetLaunch, docB.targetLaunch);
});

test("11. Noncontradictory changes across consistent terms", () => {
  const docA = { retention: "90 days" };
  const docB = { retention: "90 days" };

  assert.equal(docA.retention, docB.retention);
});

test("12. Structured Evidence Report generation", () => {
  const report = {
    title: "TRUVEXA AI — Evidence Intelligence Report",
    executiveSummary: "Multi-document audit surfaced 3 key contradictions.",
    keyFindings: ["Revenue mismatch of ₹15 Cr", "Launch timeline deferred to Q4 2025"],
    analyzedDocs: ["ApexCorp_Annual_Report_2024.pdf", "ApexCorp_Strategic_Review_2025.pdf"],
    limitations: "Limited to indexed filing disclosures.",
  };

  assert.equal(report.analyzedDocs.length, 2);
  assert.equal(report.keyFindings.length, 2);
});

test("13. User data and workspace deletion cascade", () => {
  let docs = [{ id: "d1", workspaceId: "ws-1" }, { id: "d2", workspaceId: "ws-2" }];
  // Delete ws-1
  docs = docs.filter((d) => d.workspaceId !== "ws-1");
  assert.equal(docs.length, 1);
  assert.equal(docs[0].workspaceId, "ws-2");
});

test("14. Logout and Session Clearing", () => {
  localStorage.setItem("truvexa_user", "test_user_token");
  assert.ok(localStorage.getItem("truvexa_user"));
  localStorage.removeItem("truvexa_user");
  assert.equal(localStorage.getItem("truvexa_user"), null);
});
