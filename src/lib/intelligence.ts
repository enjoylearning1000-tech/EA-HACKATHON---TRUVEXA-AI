import {
  DocumentChunk,
  DocumentItem,
  CitationItem,
  VerificationCategory,
  ClaimVerification,
  ContradictionFinding,
  DocumentComparisonResult,
  ComparisonRow,
} from "@/types";

// Helper: Tokenize text into normalized words
function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s\u00C0-\u024F\u1E00-\u1EFF]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2);
}

// Split document pages into overlapping chunks with precise metadata
export function splitPagesIntoChunks(
  docId: string,
  docName: string,
  pages: { pageNumber: number; text: string }[],
  chunkSize: number = 380,
  overlap: number = 80
): DocumentChunk[] {
  const chunks: DocumentChunk[] = [];
  let chunkIndex = 1;

  for (const page of pages) {
    const rawText = page.text.trim();
    if (!rawText) continue;

    // Split page text into sentences / paragraphs
    const paragraphs = rawText.split(/\n\s*\n/).filter((p) => p.trim().length > 0);

    for (const paragraph of paragraphs) {
      const words = paragraph.split(/\s+/);
      if (words.length <= chunkSize) {
        chunks.push({
          id: `chk_${docId}_${chunkIndex++}`,
          documentId: docId,
          documentName: docName,
          pageNumber: page.pageNumber,
          text: paragraph.trim(),
        });
      } else {
        // Slide with overlap
        let start = 0;
        while (start < words.length) {
          const chunkWords = words.slice(start, start + chunkSize);
          chunks.push({
            id: `chk_${docId}_${chunkIndex++}`,
            documentId: docId,
            documentName: docName,
            pageNumber: page.pageNumber,
            text: chunkWords.join(" "),
          });
          start += chunkSize - overlap;
        }
      }
    }
  }

  return chunks;
}

// Semantic Search & Relevance scoring using BM25-style frequency
export function retrieveRelevantChunks(
  query: string,
  chunks: DocumentChunk[],
  topK: number = 5,
  targetDocName?: string
): { chunk: DocumentChunk; score: number }[] {
  const queryTokens = tokenize(query);
  if (queryTokens.length === 0 || chunks.length === 0) return [];

  const eligibleChunks = targetDocName
    ? chunks.filter((c) => c.documentName.toLowerCase() === targetDocName.toLowerCase())
    : chunks;

  const scored = eligibleChunks.map((chunk) => {
    const chunkTokens = tokenize(chunk.text);
    const tokenFreqMap = new Map<string, number>();
    for (const t of chunkTokens) {
      tokenFreqMap.set(t, (tokenFreqMap.get(t) || 0) + 1);
    }

    let matchCount = 0;
    let score = 0;

    for (const q of queryTokens) {
      const count = tokenFreqMap.get(q) || 0;
      if (count > 0) {
        matchCount++;
        score += 1 + Math.log(count);
      }
    }

    // Boost if consecutive phrase match occurs
    if (chunk.text.toLowerCase().includes(query.toLowerCase())) {
      score += 5;
    }

    // Number matching boost
    const numbersInQuery = query.match(/\d+([.,]\d+)?/g) || [];
    for (const num of numbersInQuery) {
      if (chunk.text.includes(num)) {
        score += 3;
      }
    }

    return { chunk, score, matchCount };
  });

  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .map(({ chunk, score }) => ({ chunk, score }));
}

// Generate grounded RAG response
export async function executeRAGQuery(
  query: string,
  chunks: DocumentChunk[],
  documents: DocumentItem[],
  apiKey?: string,
  selectedDocName?: string
): Promise<{
  answer: string;
  supportingEvidence: CitationItem[];
  conflictingEvidence: CitationItem[];
  limitations: string;
  citations: CitationItem[];
}> {
  const relevant = retrieveRelevantChunks(query, chunks, 6, selectedDocName);

  if (relevant.length === 0) {
    return {
      answer: "Insufficient evidence in the selected documents to answer this question.",
      supportingEvidence: [],
      conflictingEvidence: [],
      limitations: "No matching passages or related factual context were found in the uploaded documents.",
      citations: [],
    };
  }

  const supporting: CitationItem[] = relevant.slice(0, 3).map((r) => ({
    docName: r.chunk.documentName,
    page: r.chunk.pageNumber,
    excerpt: r.chunk.text.length > 280 ? r.chunk.text.substring(0, 280) + "..." : r.chunk.text,
  }));

  // Detect if any opposing doc mentions conflicting figures/dates
  const otherDocs = relevant.filter(
    (r) => r.chunk.documentName !== relevant[0].chunk.documentName
  );
  const conflicting: CitationItem[] = [];

  if (otherDocs.length > 0) {
    for (const item of otherDocs) {
      if (item.score >= 2) {
        conflicting.push({
          docName: item.chunk.documentName,
          page: item.chunk.pageNumber,
          excerpt: item.chunk.text.substring(0, 240) + "...",
        });
      }
    }
  }

  // Synthesize answer
  let answer = "";
  if (relevant.length === 1) {
    answer = `Based on verifiable evidence in **${relevant[0].chunk.documentName}** (Page ${relevant[0].chunk.pageNumber}):\n\n${relevant[0].chunk.text.slice(0, 420)}.`;
  } else {
    answer = `Analysis of **${documents.map((d) => d.name).join(", ")}** demonstrates:\n\n• Primary factual basis from **${relevant[0].chunk.documentName}** (Page ${relevant[0].chunk.pageNumber}): "${relevant[0].chunk.text.slice(0, 260)}..."\n\n` +
      (conflicting.length > 0
        ? `• Note cross-document variance: **${conflicting[0].docName}** (Page ${conflicting[0].page}) specifies: "${conflicting[0].excerpt}".`
        : `• Corroborating context from **${relevant[1].chunk.documentName}** (Page ${relevant[1].chunk.pageNumber}).`);
  }

  const citations: CitationItem[] = relevant.map((r) => ({
    docName: r.chunk.documentName,
    page: r.chunk.pageNumber,
  }));

  // Deduplicate citations
  const uniqueCitations = citations.filter(
    (c, idx, arr) => arr.findIndex((x) => x.docName === c.docName && x.page === c.page) === idx
  );

  return {
    answer,
    supportingEvidence: supporting,
    conflictingEvidence: conflicting,
    limitations:
      conflicting.length > 0
        ? "Different documents contain differing figures or schedules. Cross-verify the reporting periods and revision dates."
        : "Evidence is restricted to the specific pages indexed above. Historical or unmentioned factors are not reflected.",
    citations: uniqueCitations,
  };
}

// Verify a user-provided Claim against Document Chunks
export async function executeClaimVerification(
  claimText: string,
  chunks: DocumentChunk[],
  workspaceId: string
): Promise<ClaimVerification> {
  const cleanClaim = claimText.trim();
  const relevant = retrieveRelevantChunks(cleanClaim, chunks, 6);

  if (relevant.length === 0) {
    return {
      id: `ver_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      workspaceId,
      claimText: cleanClaim,
      category: "Insufficient Evidence",
      explanation: "No passages in the uploaded documents provide sufficient factual evidence regarding this claim.",
      supportingEvidence: [],
      contradictingEvidence: [],
      missingInformation: "Specific documentation covering this metric, entity, or time period has not been uploaded.",
      recommendedChecks: [
        "Upload the original annexures or supporting financial audit statements.",
        "Check whether the claim pertains to an unindexed fiscal year or external entity.",
      ],
      timestamp: new Date().toISOString(),
    };
  }

  // Extract numbers, percentages, dates from claim
  const numbersInClaim = cleanClaim.match(/\d+([.,]\d+)?/g) || [];
  const topMatch = relevant[0];
  const isDirectMatch = cleanClaim.split(" ").filter((w) => topMatch.chunk.text.includes(w)).length / cleanClaim.split(" ").length > 0.65;

  let category: VerificationCategory = "Partially Supported";
  let explanation = "";
  const supporting: CitationItem[] = [];
  const contradicting: CitationItem[] = [];

  // Check if any numbers in claim conflict with numbers in retrieved chunks
  let hasNumericalDiscrepancy = false;
  let opposingChunk: DocumentChunk | null = null;

  for (const rel of relevant) {
    const chunkText = rel.chunk.text;
    for (const num of numbersInClaim) {
      if (!chunkText.includes(num)) {
        // Check if chunk discusses same topic but has different number
        const tokens = tokenize(cleanClaim);
        const overlap = tokens.filter((t) => chunkText.toLowerCase().includes(t)).length;
        if (overlap >= 2) {
          const chunkNumbers: string[] = Array.from(chunkText.match(/\d+([.,]\d+)?/g) || []);
          if (chunkNumbers.length > 0 && !chunkNumbers.includes(num)) {
            hasNumericalDiscrepancy = true;
            opposingChunk = rel.chunk;
          }
        }
      }
    }
  }

  if (hasNumericalDiscrepancy && opposingChunk) {
    category = "Contradicted";
    explanation = `The claim asserts figures that directly contradict verified source data in **${opposingChunk.documentName}** (Page ${opposingChunk.pageNumber}).`;
    contradicting.push({
      docName: opposingChunk.documentName,
      page: opposingChunk.pageNumber,
      excerpt: opposingChunk.text.slice(0, 300),
    });
    if (topMatch.chunk.id !== opposingChunk.id) {
      supporting.push({
        docName: topMatch.chunk.documentName,
        page: topMatch.chunk.pageNumber,
        excerpt: topMatch.chunk.text.slice(0, 300),
      });
    }
  } else if (isDirectMatch || topMatch.score >= 5) {
    category = "Supported";
    explanation = `The claim is corroborated by primary document evidence in **${topMatch.chunk.documentName}** (Page ${topMatch.chunk.pageNumber}).`;
    supporting.push({
      docName: topMatch.chunk.documentName,
      page: topMatch.chunk.pageNumber,
      excerpt: topMatch.chunk.text.slice(0, 300),
    });
    if (relevant.length > 1 && relevant[1].score >= 3) {
      supporting.push({
        docName: relevant[1].chunk.documentName,
        page: relevant[1].chunk.pageNumber,
        excerpt: relevant[1].chunk.text.slice(0, 300),
      });
    }
  } else {
    category = "Partially Supported";
    explanation = `Partial evidence found in **${topMatch.chunk.documentName}** (Page ${topMatch.chunk.pageNumber}), but complete qualification or context is missing.`;
    supporting.push({
      docName: topMatch.chunk.documentName,
      page: topMatch.chunk.pageNumber,
      excerpt: topMatch.chunk.text.slice(0, 300),
    });
  }

  return {
    id: `ver_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    workspaceId,
    claimText: cleanClaim,
    category,
    explanation,
    supportingEvidence: supporting,
    contradictingEvidence: contradicting,
    missingInformation:
      category === "Supported"
        ? "None. Statement conforms with primary source findings."
        : "Unambiguous executive sign-off or reconciliated ledger lines.",
    recommendedChecks: [
      `Review exact context on ${topMatch.chunk.documentName} — Page ${topMatch.chunk.pageNumber}.`,
      "Verify whether subsequent quarterly revisions amended this metric.",
    ],
    timestamp: new Date().toISOString(),
  };
}

// Cross-Document Contradiction Detector
export function executeContradictionScan(
  documents: DocumentItem[],
  chunks: DocumentChunk[],
  workspaceId: string
): ContradictionFinding[] {
  const findings: ContradictionFinding[] = [];

  if (documents.length < 2) return findings;

  // Pre-configured patterns to cross-verify across documents
  const testDimensions = [
    {
      keyword: "revenue",
      title: "Annual Revenue Discrepancy",
      category: "Numerical Mismatch" as const,
      regex: /(?:revenue|turnover)[^\n.]{0,45}(?:₹|rs\.?|\$)?\s*(\d+(?:[.,]\d+)?\s*(?:crore|cr|million|billion|lakh)?)/i,
    },
    {
      keyword: "budget",
      title: "Project Infrastructure Budget Conflict",
      category: "Numerical Mismatch" as const,
      regex: /(?:budget|expenditure|allocation)[^\n.]{0,45}(?:₹|rs\.?|\$)?\s*(\d+(?:[.,]\d+)?\s*(?:crore|cr|million|billion|lakh)?)/i,
    },
    {
      keyword: "launch",
      title: "Product Launch Target Timeline Shift",
      category: "Timeline Shift" as const,
      regex: /(?:launch|rollout|deployment|target date)[^\n.]{0,45}(q[1-4]\s*20\d\d|20\d\d|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/i,
    },
    {
      keyword: "employee",
      title: "Total Headcount Discrepancy",
      category: "Numerical Mismatch" as const,
      regex: /(?:employee|headcount|staff|workforce)[^\n.]{0,45}(\d+[\d,]*)/i,
    },
    {
      keyword: "retention",
      title: "Data Retention Policy Inconsistency",
      category: "Policy Conflict" as const,
      regex: /(?:retention|retain|purge)[^\n.]{0,45}(\d+\s*(?:day|month|year)s?)/i,
    },
  ];

  for (const dim of testDimensions) {
    const docMatches: {
      docName: string;
      page: number;
      matchedValue: string;
      excerpt: string;
    }[] = [];

    for (const doc of documents) {
      for (const page of doc.pages) {
        const match = page.text.match(dim.regex);
        if (match && match[1]) {
          docMatches.push({
            docName: doc.name,
            page: page.pageNumber,
            matchedValue: match[1].trim(),
            excerpt: page.text.slice(Math.max(0, match.index! - 30), match.index! + 120).trim(),
          });
          break; // One match per doc for this dimension
        }
      }
    }

    // Compare across distinct documents
    if (docMatches.length >= 2) {
      const first = docMatches[0];
      const second = docMatches[1];

      // Check if values differ
      if (first.matchedValue.toLowerCase() !== second.matchedValue.toLowerCase()) {
        findings.push({
          id: `ctrd_${dim.keyword}_${Date.now()}`,
          workspaceId,
          title: dim.title,
          category: dim.category,
          docA: {
            name: first.docName,
            page: first.page,
            claim: `States value as "${first.matchedValue}"`,
            excerpt: first.excerpt,
          },
          docB: {
            name: second.docName,
            page: second.page,
            claim: `States value as "${second.matchedValue}"`,
            excerpt: second.excerpt,
          },
          explanation: `Document **${first.docName}** specifies "${first.matchedValue}" on Page ${first.page}, while **${second.docName}** specifies "${second.matchedValue}" on Page ${second.page}. This creates an unaligned factual conflict requiring stakeholder verification.`,
          status: "unreviewed",
          detectedAt: new Date().toISOString(),
        });
      }
    }
  }

  return findings;
}

// Compare two documents systematically
export function executeDocumentComparison(
  docA: DocumentItem,
  docB: DocumentItem
): DocumentComparisonResult {
  const comparisonAspects = [
    { category: "Financials", aspect: "Reported Revenue", regex: /revenue[^\n.]{0,40}(?:₹|\$)?(\d+[\w\s.,]*)/i },
    { category: "Financials", aspect: "Allocated Budget", regex: /budget[^\n.]{0,40}(?:₹|\$)?(\d+[\w\s.,]*)/i },
    { category: "Timeline", aspect: "Target Release Window", regex: /(?:launch|target)[^\n.]{0,40}(q[1-4]\s*20\d\d|20\d\d)/i },
    { category: "Operations", aspect: "Active Headcount", regex: /(?:employee|headcount)[^\n.]{0,40}(\d+[\d,]*)/i },
    { category: "Governance", aspect: "Security Retention", regex: /(?:retention|retain)[^\n.]{0,40}(\d+\s*(?:day|month|year)s?)/i },
  ];

  const rows: ComparisonRow[] = [];

  for (const item of comparisonAspects) {
    let docAVal = "Not Specified";
    let docAPage = 1;
    let docBVal = "Not Specified";
    let docBPage = 1;

    for (const p of docA.pages) {
      const m = p.text.match(item.regex);
      if (m && m[1]) {
        docAVal = m[1].trim();
        docAPage = p.pageNumber;
        break;
      }
    }

    for (const p of docB.pages) {
      const m = p.text.match(item.regex);
      if (m && m[1]) {
        docBVal = m[1].trim();
        docBPage = p.pageNumber;
        break;
      }
    }

    let status: "match" | "conflict" | "different_scope" | "missing" = "match";
    if (docAVal === "Not Specified" || docBVal === "Not Specified") {
      status = "missing";
    } else if (docAVal.toLowerCase() === docBVal.toLowerCase()) {
      status = "match";
    } else {
      status = "conflict";
    }

    rows.push({
      category: item.category,
      aspect: item.aspect,
      docAValue: docAVal,
      docBValue: docBVal,
      status,
      docAPage,
      docBPage,
    });
  }

  const conflictsCount = rows.filter((r) => r.status === "conflict").length;

  return {
    id: `cmp_${docA.id}_${docB.id}`,
    workspaceId: docA.workspaceId,
    docAName: docA.name,
    docBName: docB.name,
    rows,
    summary: `Comparison between **${docA.name}** and **${docB.name}** identified ${conflictsCount} direct contradiction(s) and ${rows.filter((r) => r.status === "match").length} aligned metric(s).`,
  };
}
