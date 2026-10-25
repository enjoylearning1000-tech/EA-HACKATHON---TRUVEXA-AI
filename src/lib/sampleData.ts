import { DocumentItem, Workspace, ClaimVerification, ContradictionFinding } from "@/types";
import { splitPagesIntoChunks } from "./intelligence";

export const DEFAULT_WORKSPACE: Workspace = {
  id: "ws-demo-01",
  name: "ApexCorp Enterprise Due Diligence",
  description: "Cross-document verification of financial disclosures and operational roadmaps.",
  createdAt: "2026-10-24T14:00:00Z",
  updatedAt: "2026-10-25T08:30:00Z",
  documentCount: 2,
};

export const SAMPLE_DOCUMENTS: DocumentItem[] = [
  {
    id: "doc-2024-annual",
    workspaceId: "ws-demo-01",
    name: "ApexCorp_Annual_Report_2024.pdf",
    size: 2450000,
    pageCount: 3,
    uploadedAt: "2026-10-24T14:15:00Z",
    status: "ready",
    extractedText: `APEXCORP FINANCIAL & OPERATIONAL REPORT 2024
Page 1:
ApexCorp demonstrated sustained operational acceleration across all key verticals in fiscal year 2024. Total reported annual revenue reached ₹120 Crore, representing an increase of 25% year-over-year. The core enterprise division contributed 65% of the gross proceeds, supported by robust regional expansion in tier-1 markets.

Page 2:
Infrastructure and capital investments were prioritized to modernize cloud infrastructure. The executive board sanctioned an allocated project budget of ₹15 Crore dedicated to Project Titan. Under this strategic allocation, the organization expanded its active talent base, closing the fiscal year with 450 full-time employees across four engineering centers.

Page 3:
Regarding commercialization roadmaps, Project Titan is officially scheduled for a target launch in Q2 2025. Security protocols adhere strictly to enterprise compliance standards, enforcing a mandatory security data retention period of 90 days for all customer access telemetry.`,
    pages: [
      {
        pageNumber: 1,
        text: "ApexCorp demonstrated sustained operational acceleration across all key verticals in fiscal year 2024. Total reported annual revenue reached ₹120 Crore, representing an increase of 25% year-over-year. The core enterprise division contributed 65% of the gross proceeds, supported by robust regional expansion in tier-1 markets.",
      },
      {
        pageNumber: 2,
        text: "Infrastructure and capital investments were prioritized to modernize cloud infrastructure. The executive board sanctioned an allocated project budget of ₹15 Crore dedicated to Project Titan. Under this strategic allocation, the organization expanded its active talent base, closing the fiscal year with 450 full-time employees across four engineering centers.",
      },
      {
        pageNumber: 3,
        text: "Regarding commercialization roadmaps, Project Titan is officially scheduled for a target launch in Q2 2025. Security protocols adhere strictly to enterprise compliance standards, enforcing a mandatory security data retention period of 90 days for all customer access telemetry.",
      },
    ],
    chunksCount: 3,
  },
  {
    id: "doc-2025-review",
    workspaceId: "ws-demo-01",
    name: "ApexCorp_Strategic_Review_2025.pdf",
    size: 3120000,
    pageCount: 3,
    uploadedAt: "2026-10-24T14:30:00Z",
    status: "ready",
    extractedText: `APEXCORP STRATEGIC AUDIT & REVIEW 2025
Page 1:
Following comprehensive internal reconciliations and accounting adjustments, the audited financial figures for the prior operating year have been adjusted. Reconciled annual revenue for 2024 was certified at ₹105 Crore, reflecting deferrals in deferred software maintenance revenue and customer credits.

Page 2:
Project Titan encountered unforeseen engineering complexities during hardware integration testing. Consequently, the revised project budget has been escalated to ₹22 Crore to accommodate specialized vendor licensing. Workforce rightsizing and automation efficiencies reduced total active employee headcount to 410 staff members.

Page 3:
Commercial deployment timeline has been recalibrated: the executive committee confirmed a rescheduled target launch in Q4 2025. Security policies remain uniform across all business units, mandating standard security data retention of 90 days.`,
    pages: [
      {
        pageNumber: 1,
        text: "Following comprehensive internal reconciliations and accounting adjustments, the audited financial figures for the prior operating year have been adjusted. Reconciled annual revenue for 2024 was certified at ₹105 Crore, reflecting deferrals in deferred software maintenance revenue and customer credits.",
      },
      {
        pageNumber: 2,
        text: "Project Titan encountered unforeseen engineering complexities during hardware integration testing. Consequently, the revised project budget has been escalated to ₹22 Crore to accommodate specialized vendor licensing. Workforce rightsizing and automation efficiencies reduced total active employee headcount to 410 staff members.",
      },
      {
        pageNumber: 3,
        text: "Commercial deployment timeline has been recalibrated: the executive committee confirmed a rescheduled target launch in Q4 2025. Security policies remain uniform across all business units, mandating standard security data retention of 90 days.",
      },
    ],
    chunksCount: 3,
  },
];

export const INITIAL_CHUNKS = [
  ...splitPagesIntoChunks(SAMPLE_DOCUMENTS[0].id, SAMPLE_DOCUMENTS[0].name, SAMPLE_DOCUMENTS[0].pages),
  ...splitPagesIntoChunks(SAMPLE_DOCUMENTS[1].id, SAMPLE_DOCUMENTS[1].name, SAMPLE_DOCUMENTS[1].pages),
];

export const SAMPLE_CLAIMS_FOR_CLICK: string[] = [
  "The company's annual revenue reached ₹120 Crore in 2024.",
  "The allocated project budget for Project Titan is ₹15 Crore.",
  "Project Titan is scheduled for target launch in Q2 2025.",
  "ApexCorp reported an active workforce headcount of 450 employees.",
  "ApexCorp acquired an international AI company in Germany.",
];
