"use client";

import React, { useState, useEffect } from "react";
import SplashScreen from "@/components/SplashScreen";
import AuthScreen from "@/components/AuthScreen";
import OnboardingModal from "@/components/OnboardingModal";
import TopNav from "@/components/TopNav";
import Sidebar, { TabId } from "@/components/Sidebar";
import PdfViewerModal from "@/components/PdfViewerModal";
import GlobalSearchModal from "@/components/GlobalSearchModal";

// Views
import OverviewView from "@/components/views/OverviewView";
import WorkspacesView from "@/components/views/WorkspacesView";
import UploadView from "@/components/views/UploadView";
import LibraryView from "@/components/views/LibraryView";
import AssistantView from "@/components/views/AssistantView";
import ClaimVerificationView from "@/components/views/ClaimVerificationView";
import ContradictionView from "@/components/views/ContradictionView";
import ComparisonView from "@/components/views/ComparisonView";
import EvidenceGraphView from "@/components/views/EvidenceGraphView";
import ReportsView from "@/components/views/ReportsView";
import HistoryView from "@/components/views/HistoryView";
import SettingsView from "@/components/views/SettingsView";

import {
  UserProfile,
  Workspace,
  DocumentItem,
  DocumentChunk,
  ClaimVerification,
  ContradictionFinding,
  EvidenceReport,
  ActivityLog,
} from "@/types";
import { TruvexaStore } from "@/lib/store";

export default function Home() {
  const [splashDone, setSplashDone] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>("overview");

  // Domain state
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string>("");
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [chunks, setChunks] = useState<DocumentChunk[]>([]);
  const [claims, setClaims] = useState<ClaimVerification[]>([]);
  const [contradictions, setContradictions] = useState<ContradictionFinding[]>([]);
  const [reports, setReports] = useState<EvidenceReport[]>([]);
  const [activities, setActivities] = useState<ActivityLog[]>([]);

  // Modals
  const [searchOpen, setSearchOpen] = useState(false);
  const [activePdfDoc, setActivePdfDoc] = useState<DocumentItem | null>(null);
  const [activePdfPage, setActivePdfPage] = useState<number>(1);
  const [activePdfExcerpt, setActivePdfExcerpt] = useState<string | undefined>(undefined);

  // Initialize and load persistent data
  const refreshAllData = () => {
    const u = TruvexaStore.getUser();
    setUser(u);

    const wsList = TruvexaStore.getWorkspaces();
    setWorkspaces(wsList);

    const activeWsId = TruvexaStore.getActiveWorkspaceId();
    setActiveWorkspaceId(activeWsId);

    const docs = TruvexaStore.getDocuments(activeWsId);
    setDocuments(docs);

    const chks = TruvexaStore.getChunks(activeWsId);
    setChunks(chks);

    const cls = TruvexaStore.getVerifications(activeWsId);
    setClaims(cls);

    const ctrds = TruvexaStore.getContradictions(activeWsId);
    setContradictions(ctrds);

    const reps = TruvexaStore.getReports(activeWsId);
    setReports(reps);

    const acts = TruvexaStore.getActivities(activeWsId);
    setActivities(acts);
  };

  useEffect(() => {
    // Check if splash screen was already displayed in this browser session
    const hasSeenSplash = sessionStorage.getItem("truvexa_splash_seen");
    if (hasSeenSplash) {
      setSplashDone(true);
    }
    refreshAllData();
  }, []);

  const handleSplashComplete = () => {
    sessionStorage.setItem("truvexa_splash_seen", "true");
    setSplashDone(true);
    const existingUser = TruvexaStore.getUser();
    if (existingUser) {
      setUser(existingUser);
    }
  };

  const handleLoginSuccess = (profile: UserProfile) => {
    setUser(profile);
    refreshAllData();
    // Show onboarding for newly created profile
    const hasSeenOnboarding = localStorage.getItem("truvexa_onboarding_done");
    if (!hasSeenOnboarding) {
      setShowOnboarding(true);
    }
  };

  const handleLogout = () => {
    TruvexaStore.logout();
    setUser(null);
  };

  const handleSelectWorkspace = (id: string) => {
    TruvexaStore.setActiveWorkspaceId(id);
    setActiveWorkspaceId(id);
    refreshAllData();
  };

  const handleOpenPdf = (doc: DocumentItem, page: number = 1, excerpt?: string) => {
    setActivePdfDoc(doc);
    setActivePdfPage(page);
    setActivePdfExcerpt(excerpt);
  };

  // 1. SCREEN 1: Splash Screen
  if (!splashDone) {
    return <SplashScreen onComplete={handleSplashComplete} />;
  }

  // 2. SCREEN 2: Login / Registration
  if (!user) {
    return <AuthScreen onLoginSuccess={handleLoginSuccess} />;
  }

  // 3 & 4. Main Intelligence Application
  return (
    <div className="min-h-screen bg-[#071426] text-white flex flex-col font-sans">
      {/* Top Navigation */}
      <TopNav
        user={user}
        workspaces={workspaces}
        activeWorkspaceId={activeWorkspaceId}
        onSelectWorkspace={handleSelectWorkspace}
        onOpenSearch={() => setSearchOpen(true)}
        onLogout={handleLogout}
        onOpenCreateWs={() => setActiveTab("workspaces")}
      />

      {/* Main Body Layout: Sidebar + Dynamic Workspace View */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          documentCount={documents.length}
          contradictionCount={contradictions.filter((c) => c.status === "unreviewed").length}
          claimsCount={claims.length}
        />

        {/* Viewport Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-gradient-to-br from-[#071426] via-[#0B1F38] to-[#040D1A]">
          {activeTab === "overview" && (
            <OverviewView
              documents={documents}
              claims={claims}
              contradictions={contradictions}
              reports={reports}
              activities={activities}
              onSelectTab={setActiveTab}
              onOpenPdf={handleOpenPdf}
            />
          )}

          {activeTab === "workspaces" && (
            <WorkspacesView
              workspaces={workspaces}
              activeWorkspaceId={activeWorkspaceId}
              documents={documents}
              onSelectWorkspace={handleSelectWorkspace}
              onRefreshWorkspaces={refreshAllData}
            />
          )}

          {activeTab === "upload" && (
            <UploadView
              activeWorkspaceId={activeWorkspaceId}
              onUploadComplete={refreshAllData}
              onSelectTab={setActiveTab}
            />
          )}

          {activeTab === "library" && (
            <LibraryView
              documents={documents}
              activeWorkspaceId={activeWorkspaceId}
              onRefreshDocs={refreshAllData}
              onOpenPdf={handleOpenPdf}
              onSelectTab={setActiveTab}
            />
          )}

          {activeTab === "assistant" && (
            <AssistantView
              documents={documents}
              chunks={chunks}
              activeWorkspaceId={activeWorkspaceId}
              onOpenPdf={handleOpenPdf}
            />
          )}

          {activeTab === "claim-verification" && (
            <ClaimVerificationView
              documents={documents}
              chunks={chunks}
              activeWorkspaceId={activeWorkspaceId}
              onOpenPdf={handleOpenPdf}
              onRefreshClaims={refreshAllData}
            />
          )}

          {activeTab === "contradictions" && (
            <ContradictionView
              documents={documents}
              chunks={chunks}
              activeWorkspaceId={activeWorkspaceId}
              onOpenPdf={handleOpenPdf}
              onRefreshContradictions={refreshAllData}
            />
          )}

          {activeTab === "comparison" && (
            <ComparisonView
              documents={documents}
              chunks={chunks}
              onOpenPdf={handleOpenPdf}
            />
          )}

          {activeTab === "evidence-graph" && (
            <EvidenceGraphView
              documents={documents}
              claims={claims}
              contradictions={contradictions}
              onOpenPdf={handleOpenPdf}
            />
          )}

          {activeTab === "reports" && (
            <ReportsView
              documents={documents}
              claims={claims}
              contradictions={contradictions}
              reports={reports}
              activeWorkspaceId={activeWorkspaceId}
              onRefreshReports={refreshAllData}
            />
          )}

          {activeTab === "history" && <HistoryView activities={activities} />}

          {activeTab === "settings" && <SettingsView />}
        </main>
      </div>

      {/* Screen 3: First-time Onboarding Modal */}
      {showOnboarding && (
        <OnboardingModal
          onComplete={() => {
            localStorage.setItem("truvexa_onboarding_done", "true");
            setShowOnboarding(false);
          }}
          onSelectTab={(tab) => setActiveTab(tab as TabId)}
        />
      )}

      {/* Integrated PDF / Text Viewer Modal */}
      <PdfViewerModal
        document={activePdfDoc}
        targetPage={activePdfPage}
        highlightExcerpt={activePdfExcerpt}
        onClose={() => setActivePdfDoc(null)}
      />

      {/* Global Search Modal */}
      <GlobalSearchModal
        documents={documents}
        claims={claims}
        contradictions={contradictions}
        reports={reports}
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          setSearchOpen(false);
        }}
        onOpenPdf={handleOpenPdf}
      />
    </div>
  );
}
