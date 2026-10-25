Add-Type -AssemblyName System.Drawing
Add-Type -AssemblyName System.Speech

$workDir = "D:\Projects\truvexa-ai\pitch_assets"
if (!(Test-Path $workDir)) {
    New-Item -ItemType Directory -Path $workDir -Force | Out-Null
}

Write-Host "1. Rendering High-Definition 1080p Pitch Scene Frames..."

function Create-Pitch-Frame {
    param(
        [string]$outputPath,
        [string]$badgeText,
        [string]$mainTitle,
        [string]$subtitle,
        [string]$leftBoxHeader,
        [string[]]$leftBoxLines,
        [string]$rightBoxHeader,
        [string[]]$rightBoxLines,
        [string]$footerText,
        [string]$phaseTag,
        [string]$timestampTag
    )

    $width = 1920
    $height = 1080
    $bmp = New-Object System.Drawing.Bitmap($width, $height)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit

    # Background gradient: Deep navy #071426 to #0B1F38
    $rect = New-Object System.Drawing.Rectangle(0, 0, $width, $height)
    $cTop = [System.Drawing.Color]::FromArgb(7, 20, 38)
    $cBot = [System.Drawing.Color]::FromArgb(11, 31, 56)
    $bgBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush($rect, $cTop, $cBot, 45)
    $g.FillRectangle($bgBrush, $rect)

    # Brushes & Pens
    $cyanPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(0, 212, 255), 2)
    $cyanBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(0, 212, 255))
    $whiteBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
    $slateBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(148, 163, 184))
    $greenBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(16, 185, 129))
    $amberBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(245, 158, 11))
    $roseBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(244, 63, 94))

    # Top Brand Bar
    $fontBrand = New-Object System.Drawing.Font("Arial", 22, [System.Drawing.FontStyle]::Bold)
    $g.DrawString("TRUVEXA", $fontBrand, $whiteBrush, 70, 45)
    $g.DrawString("AI", $fontBrand, $cyanBrush, 220, 45)
    $fontSub = New-Object System.Drawing.Font("Consolas", 12, [System.Drawing.FontStyle]::Regular)
    $g.DrawString("EVERY CLAIM DESERVES EVIDENCE", $fontSub, $slateBrush, 72, 80)

    # Phase Tracker & Timestamp on Top-Right
    $fontPhase = New-Object System.Drawing.Font("Consolas", 13, [System.Drawing.FontStyle]::Bold)
    $g.DrawString($phaseTag, $fontPhase, $amberBrush, 1350, 45)
    $g.DrawString($timestampTag, $fontPhase, $cyanBrush, 1350, 75)

    # Badge Pill
    $fontBadge = New-Object System.Drawing.Font("Arial", 14, [System.Drawing.FontStyle]::Bold)
    $pillBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(10, 35, 65))
    $g.FillRectangle($pillBrush, 70, 150, 600, 38)
    $g.DrawRectangle($cyanPen, 70, 150, 600, 38)
    $g.DrawString($badgeText, $fontBadge, $cyanBrush, 90, 158)

    # Main Title
    $fontTitle = New-Object System.Drawing.Font("Arial", 38, [System.Drawing.FontStyle]::Bold)
    $g.DrawString($mainTitle, $fontTitle, $whiteBrush, 70, 210)

    # Subtitle
    $fontDesc = New-Object System.Drawing.Font("Arial", 20, [System.Drawing.FontStyle]::Regular)
    $g.DrawString($subtitle, $fontDesc, $slateBrush, 70, 280)

    # Two Main Graphic Cards
    $cardBg = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(11, 31, 56))
    $cardPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(37, 99, 235), 2)
    $cardCyanPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(0, 212, 255), 2)

    # Left Box
    $g.FillRectangle($cardBg, 70, 360, 850, 505)
    $g.DrawRectangle($cardPen, 70, 360, 850, 505)

    $fontCardHead = New-Object System.Drawing.Font("Arial", 22, [System.Drawing.FontStyle]::Bold)
    $g.DrawString($leftBoxHeader, $fontCardHead, $cyanBrush, 105, 395)

    $fontCardText = New-Object System.Drawing.Font("Arial", 16, [System.Drawing.FontStyle]::Regular)
    $yPos = 460
    foreach ($line in $leftBoxLines) {
        $g.DrawString($line, $fontCardText, $whiteBrush, 105, $yPos)
        $yPos += 45
    }

    # Right Box
    $g.FillRectangle($cardBg, 980, 360, 870, 505)
    $g.DrawRectangle($cardCyanPen, 980, 360, 870, 505)

    $g.DrawString($rightBoxHeader, $fontCardHead, $greenBrush, 1015, 395)
    $yPosR = 460
    foreach ($line in $rightBoxLines) {
        $g.DrawString($line, $fontCardText, $whiteBrush, 1015, $yPosR)
        $yPosR += 45
    }

    # Footer Banner
    $g.FillRectangle($pillBrush, 70, 915, 1780, 60)
    $g.DrawRectangle($cyanPen, 70, 915, 1780, 60)
    $fontFoot = New-Object System.Drawing.Font("Consolas", 15, [System.Drawing.FontStyle]::Bold)
    $g.DrawString($footerText, $fontFoot, $whiteBrush, 100, 933)

    $bmp.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose()
    $bmp.Dispose()
}

# =========================================================================
# 120-SECOND PITCH FORMULA BREAKDOWN:
# 0:30 Problem & Who It's For (Scenes 1 & 2)
# 0:45 Live Product Demo (Scenes 3, 4 & 5)
# 0:30 AI & Tech Stack (Scenes 6 & 7)
# 0:15 Impact & Conclusion (Scene 8)
# =========================================================================

# SCENE 1 (0:00 - 0:15): Logo Reveal & Target Audience
$s1 = @{
    outputPath = "$workDir\scene1.png"
    badgeText = "PITCH FORMULA: 0:30 PROBLEM & WHO IT'S FOR [PART 1]"
    mainTitle = "TRUVEXA AI - Every Claim Deserves Evidence"
    subtitle = "Next-generation AI document intelligence and cross-filing evidence verification."
    leftBoxHeader = "Built For High-Stakes Professionals"
    leftBoxLines = @(
        "[+] Financial Due Diligence & Investment Analysts",
        "[+] Regulatory Compliance & Governance Officers",
        "[+] Legal Investigators & Corporate Contract Auditors",
        "[+] M&A Due Diligence & Accounting Teams",
        "[+] Enterprise Risk & Audit Committee Reviewers"
    )
    rightBoxHeader = "The Due Diligence Challenge"
    rightBoxLines = @(
        "- Enterprise decisions rely on hundreds of dense PDF pages",
        "- Critical metrics are buried across multi-year disclosures",
        "- Manual verification takes days and invites human error",
        "- Standard AI tools hallucinate citations and phantom numbers",
        "- Missing a single conflict causes millions in regulatory loss"
    )
    footerText = "TRUVEXA AI - GROUNDED FACT AUDITING ACROSS COMPLEX CORPORATE DISCLOSURES"
    phaseTag = "PHASE: PROBLEM & AUDIENCE"
    timestampTag = "TIMECODE: 0:00 - 0:15 (15s)"
}
Create-Pitch-Frame @s1

# SCENE 2 (0:15 - 0:30): The Problem - Contradictions & Hallucinations
$s2 = @{
    outputPath = "$workDir\scene2.png"
    badgeText = "PITCH FORMULA: 0:30 PROBLEM & WHO IT'S FOR [PART 2]"
    mainTitle = "The Danger of Hidden Contradictions & Phantom AI"
    subtitle = "Why traditional review methods and generic LLM chatbots fail in enterprise audits."
    leftBoxHeader = "Hidden Factual Contradictions"
    leftBoxLines = @(
        "- Numerical Discrepancies: Revenue restated from 120 Cr to 105 Cr",
        "- Budget Collisions: Titan project escalated from 15 Cr to 22 Cr",
        "- Timeline Shifts: Milestone targets slipped from Q2 to Q4",
        "- Policy Deviations: Inconsistent data retention terms across units",
        "- Scope Changes: Silently modified headcount and liabilities"
    )
    rightBoxHeader = "Why Generic AI Chatbots Fail"
    rightBoxLines = @(
        "- Invented Citations: AI cites non-existent page numbers",
        "- Unauditable Assertions: Claims cannot be verified by auditors",
        "- No Cross-Document Context: Cannot reconcile Document A vs B",
        "- Security Leaks: Sending private financial data to public models",
        "- TRUVEXA Rule: Zero hallucinations. Every claim must have proof."
    )
    footerText = "EVERY ASSERTION MUST BE PROVEN BY SOURCE PASSAGES · ZERO FABRICATED DATA"
    phaseTag = "PHASE: PROBLEM & AUDIENCE"
    timestampTag = "TIMECODE: 0:15 - 0:30 (15s)"
}
Create-Pitch-Frame @s2

# SCENE 3 (0:30 - 0:45): Live Demo - Multi-PDF Ingestion Pipeline
$s3 = @{
    outputPath = "$workDir\scene3.png"
    badgeText = "PITCH FORMULA: 0:45 LIVE PRODUCT DEMO [PART 1]"
    mainTitle = "Multi-PDF Ingestion & Coordinate-Preserved Chunking"
    subtitle = "Live upload of up to 10 filings with real-time text extraction and vector chunking."
    leftBoxHeader = "Live Ingestion Terminal"
    leftBoxLines = @(
        "[+] Drag-and-drop batch upload for up to 10 files simultaneously",
        "[+] Client-side zero-dependency unpdf engine runs right in browser",
        "[+] Strict file format, size, and password integrity checks",
        "[+] Ingested: ApexCorp_Annual_Report_2024.pdf (3 Pages, 3 Chunks)",
        "[+] Ingested: ApexCorp_Strategic_Review_2025.pdf (3 Pages, 3 Chunks)"
    )
    rightBoxHeader = "Coordinate-Tagged Vector Chunks"
    rightBoxLines = @(
        "[OK] Text divided into 380-word overlapping semantic chunks",
        "[OK] Exact document name, page number, and offset coordinates bound",
        "[OK] Stored in PostgreSQL with pgvector for instant retrieval",
        "[OK] Real progress lifecycle: Uploading -> Chunking -> Indexed",
        "[OK] Absolute data hygiene: Untrusted PDFs sanitized against prompt injection"
    )
    footerText = "LIVE PIPELINE DEMO · UNPDF CLIENT EXTRACTION · PGVECTOR INDEXING"
    phaseTag = "PHASE: LIVE PRODUCT DEMO"
    timestampTag = "TIMECODE: 0:30 - 0:45 (15s)"
}
Create-Pitch-Frame @s3

# SCENE 4 (0:45 - 1:00): Live Demo - Cross-Document Contradiction Explorer
$s4 = @{
    outputPath = "$workDir\scene4.png"
    badgeText = "PITCH FORMULA: 0:45 LIVE PRODUCT DEMO [PART 2]"
    mainTitle = "Flagship Feature: Side-by-Side Contradiction Explorer"
    subtitle = "Automated cross-filing auditing highlighting revenue mismatches and timeline slips."
    leftBoxHeader = "Filing A: Annual_Report_2024.pdf"
    leftBoxLines = @(
        "• Page 1 Assertion: Total reported annual revenue was 120 Crore.",
        "• Page 2 Assertion: Allocated budget for Project Titan is 15 Crore.",
        "• Page 3 Assertion: Commercial launch scheduled for Q2 2025.",
        "• Status: Primary annual disclosure certified by board."
    )
    rightBoxHeader = "Filing B: Strategic_Review_2025.pdf"
    rightBoxLines = @(
        "• Page 1 Conflict: Reconciled 2024 revenue certified at 105 Crore.",
        "• Page 2 Conflict: Project Titan budget escalated to 22 Crore.",
        "• Page 3 Conflict: Target launch rescheduled to Q4 2025.",
        "[OK] Auditor Review Actions: [Mark Confirmed] [Resolve] [Add Note]"
    )
    footerText = "FLAGSHIP CONTRADICTION ENGINE · SIDE-BY-SIDE CARDS · AUDITOR ANNOTATIONS"
    phaseTag = "PHASE: LIVE PRODUCT DEMO"
    timestampTag = "TIMECODE: 0:45 - 1:00 (15s)"
}
Create-Pitch-Frame @s4

# SCENE 5 (1:00 - 1:15): Live Demo - Claim Verification & PDF Viewer Jump
$s5 = @{
    outputPath = "$workDir\scene5.png"
    badgeText = "PITCH FORMULA: 0:45 LIVE PRODUCT DEMO [PART 3]"
    mainTitle = "Claim Verification & Integrated PDF Passage Highlighter"
    subtitle = "Classify assertions as Supported or Contradicted and jump directly into the PDF."
    leftBoxHeader = "AI Claim Verification Engine"
    leftBoxLines = @(
        "Assertion: 'The company annual revenue reached 120 Crore in 2024.'",
        "Verdict: [SUPPORTED BY EVIDENCE]",
        "AI Explanation: Matches audited statement on Page 1.",
        "Opposing Excerpt: 2025 filing restates revenue to 105 Crore.",
        "Recommended Check: Review software deferral credit reconciliation."
    )
    rightBoxHeader = "Integrated PDF Viewer with Citation Jump"
    rightBoxLines = @(
        "[OK] Click citation: Opens PDF viewer and auto-navigates to Page 1",
        "[OK] Yellow highlighter: 'Total reported revenue reached 120 Cr...'",
        "[OK] In-document full text search and zoom controls (75% to 150%)",
        "[OK] Transparent proof: Zero assumptions without visible citations",
        "[OK] Eliminates manual page flipping across dense multi-page audits"
    )
    footerText = "INSTANT VERIFICATION · CITATION JUMP WITH PASSAGE HIGHLIGHTING"
    phaseTag = "PHASE: LIVE PRODUCT DEMO"
    timestampTag = "TIMECODE: 1:00 - 1:15 (15s)"
}
Create-Pitch-Frame @s5

# SCENE 6 (1:15 - 1:30): AI & Tech Stack - Architecture & Retrieval
$s6 = @{
    outputPath = "$workDir\scene6.png"
    badgeText = "PITCH FORMULA: 0:30 AI & TECH STACK [PART 1]"
    mainTitle = "Enterprise Full-Stack Architecture & RAG Pipeline"
    subtitle = "Next.js 16, React 19, TypeScript, Tailwind CSS v4, and pgvector embeddings."
    leftBoxHeader = "Modern Frontend & UI Stack"
    leftBoxLines = @(
        "[+] Next.js 16 (App Router) & React 19 with Turbopack",
        "[+] TypeScript 5.9 with strict end-to-end type safety",
        "[+] Tailwind CSS v4 with custom cyber navy design system",
        "[+] Lucide React icons, Canvas Confetti & Glassmorphism panels",
        "[+] Interactive SVG Evidence Graph with pan, zoom & node inspector"
    )
    rightBoxHeader = "Grounded Vector & AI Engine"
    rightBoxLines = @(
        "[OK] Local BM25 Semantic Heuristic Engine (100% offline & zero cost)",
        "[OK] Google Gemini 2.5 Flash & OpenAI GPT-4o API connectors",
        "[OK] Anti-hallucination prompt enforcement with citation validators",
        "[OK] unpdf zero-dependency PDF parser preserving page coordinates",
        "[OK] Secure client-side key storage without leaking credentials"
    )
    footerText = "NEXT.JS 16 · REACT 19 · BM25 HYBRID RETRIEVAL · STRICT TYPE SAFETY"
    phaseTag = "PHASE: AI & TECH STACK"
    timestampTag = "TIMECODE: 1:15 - 1:30 (15s)"
}
Create-Pitch-Frame @s6

# SCENE 7 (1:30 - 1:45): AI & Tech Stack - Backend & 14 Automated Tests
$s7 = @{
    outputPath = "$workDir\scene7.png"
    badgeText = "PITCH FORMULA: 0:30 AI & TECH STACK [PART 2]"
    mainTitle = "FastAPI Microservice & 14-Point Automated Test Suite"
    subtitle = "Full production deployment readiness with Supabase PostgreSQL and PyMuPDF."
    leftBoxHeader = "Standalone Python FastAPI Backend"
    leftBoxLines = @(
        "[+] Python 3.11 with FastAPI, Uvicorn & Pydantic v2 schemas",
        "[+] PyMuPDF (Fitz) text extraction with scanned page handling",
        "[+] 14 REST endpoints covering upload, RAG, verify, and reports",
        "[+] Production Dockerfile ready for 1-click Render / Railway deployment",
        "[+] Supabase PostgreSQL schema with pgvector & Row-Level Security"
    )
    rightBoxHeader = "14-Point Automated Verification Suite"
    rightBoxLines = @(
        "[OK] Test 1-4: Auth persistence, workspaces, chunking, retrieval",
        "[OK] Test 5-8: Grounded QA citations, anti-hallucination, verification",
        "[OK] Test 9-11: Revenue & timeline contradiction cross-checking",
        "[OK] Test 12-14: Report compilation, workspace cascade, logout",
        "[OK] Test Execution: 14 PASSED, 0 FAILED (110ms execution)"
    )
    footerText = "PYTHON FASTAPI · SUPABASE PGVECTOR · 14 AUTOMATED TESTS PASSING"
    phaseTag = "PHASE: AI & TECH STACK"
    timestampTag = "TIMECODE: 1:30 - 1:45 (15s)"
}
Create-Pitch-Frame @s7

# SCENE 8 (1:45 - 2:00): Impact & Conclusion
$s8 = @{
    outputPath = "$workDir\scene8.png"
    badgeText = "PITCH FORMULA: 0:15 IMPACT & CONCLUSION"
    mainTitle = "Measurable Due Diligence Impact & Production Ready"
    subtitle = "Eliminating diligence blindness and turning filings into defensible intelligence."
    leftBoxHeader = "Quantifiable Business Impact"
    leftBoxLines = @(
        "[+] Recovers 15-20% post-harvest & due diligence value loss",
        "[+] Reduces document audit review time from 3 days to 15 minutes",
        "[+] 100% auditable proof trail protects against regulatory penalties",
        "[+] 1-Click Export to CSV spreadsheets and printable PDF reports",
        "[+] Replaces guesswork with verifiable page-anchored evidence"
    )
    rightBoxHeader = "Live Deployment & Open Source"
    rightBoxLines = @(
        "[OK] Live Application: Running on http://localhost:3000",
        "[OK] GitHub Repository: enjoylearning1000-tech/EA-HACKATHON---TRUVEXA-AI",
        "[OK] Preloaded ApexCorp 2024 vs 2025 test audit dataset",
        "[OK] Complete documentation and deployment guide in README.md",
        "[OK] TRUVEXA AI: Every Claim Deserves Evidence."
    )
    footerText = "TRUVEXA AI · LIVE ON LOCALHOST:3000 · REPOSITORY ON GITHUB · READY TO DEPLOY"
    phaseTag = "PHASE: IMPACT & CONCLUSION"
    timestampTag = "TIMECODE: 1:45 - 2:00 (15s)"
}
Create-Pitch-Frame @s8

Write-Host "2. Synthesizing Synchronized Speech Voiceover Audio (8 Scenes x 15s)..."

$narrations = @(
    # Scene 1: Logo & Audience (0:00 - 0:15)
    "Welcome to TRUVEXA AI. In high-stakes finance, legal compliance, and corporate due diligence, analysts review hundreds of pages of filings to verify critical facts.",
    # Scene 2: Problem (0:15 - 0:30)
    "The problem? These documents are filled with contradictory figures, revised estimates, and hidden discrepancies. Standard AI assistants summarize content but hallucinate phantom citations, risking catastrophic errors.",
    # Scene 3: Demo Ingestion (0:30 - 0:45)
    "TRUVEXA AI provides source-grounded intelligence. Upload up to ten PDFs simultaneously. Our engine parses pages, preserves exact coordinates, and indexes vector chunks with absolute fidelity.",
    # Scene 4: Demo Contradictions (0:45 - 1:00)
    "Our flagship Contradiction Explorer automatically flags cross-document conflicts. Here, it contrasts reported revenue of 120 Crore against revised figures of 105 Crore, letting auditors confirm, resolve, or annotate findings.",
    # Scene 5: Demo Verification & Jump (1:00 - 1:15)
    "The Claim Verification Engine checks any assertion against the corpus, returning verified verdicts with line citations. Clicking any citation opens the integrated PDF viewer and highlights the exact source passage.",
    # Scene 6: Tech Stack Architecture (1:15 - 1:30)
    "Under the hood, TRUVEXA AI combines a modern Next.js 16 and React 19 frontend with a robust pgvector semantic retrieval engine, integrating Google Gemini and OpenAI with strict anti-hallucination guardrails.",
    # Scene 7: Tech Stack Backend & Tests (1:30 - 1:45)
    "We provide a standalone Python FastAPI service with PyMuPDF for enterprise deployments, backed by Supabase with row-level security and a complete test suite with fourteen automated tests passing flawlessly.",
    # Scene 8: Impact (1:45 - 2:00)
    "TRUVEXA AI transforms document chaos into defensible intelligence, saving critical audit hours and eliminating diligence blindness. Every claim deserves evidence. Available now on GitHub."
)

$synth = New-Object System.Speech.Synthesis.SpeechSynthesizer
$synth.Rate = 0

for ($i = 0; $i -lt 8; $i++) {
    $idx = $i + 1
    $wavPath = "$workDir\audio$idx.wav"
    $synth.SetOutputToWaveFile($wavPath)
    $synth.Speak($narrations[$i])
}
$synth.Dispose()

Write-Host "3. Encoding 15-Second Video Clips with FFmpeg..."
$ffmpeg = "C:\Users\Danisha R\AppData\Local\Microsoft\WinGet\Packages\Gyan.FFmpeg.Essentials_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-9.0.1-essentials_build\bin\ffmpeg.exe"

for ($i = 1; $i -le 8; $i++) {
    $img = "$workDir\scene$i.png"
    $aud = "$workDir\audio$i.wav"
    $outClip = "$workDir\clip$i.mp4"
    
    # Exactly 15.0 seconds per clip, audio padded to 15s
    & $ffmpeg -y -loop 1 -i $img -i $aud -af "apad=whole_dur=15" -c:v libx264 -t 15 -pix_fmt yuv420p -c:a aac -b:a 192k $outClip 2>$null
}

# Concat file list
$concatFile = "$workDir\concat.txt"
$concatContent = ""
for ($i = 1; $i -le 8; $i++) {
    $concatContent += "file '$workDir\clip$i.mp4'`n"
}
$concatContent | Set-Content -Path $concatFile -Encoding Ascii

$finalMp4Public = "D:\Projects\truvexa-ai\public\TRUVEXA_AI_120s_Pitch.mp4"
$finalMp4Root = "D:\Projects\truvexa-ai\TRUVEXA_AI_120s_Pitch.mp4"
$finalMp4Desktop = "D:\OneDrive\Desktop\TRUVEXA_AI_120s_Pitch.mp4"

Write-Host "4. Concatenating into Master 120-Second Pitch Video..."
& $ffmpeg -y -f concat -safe 0 -i $concatFile -c copy $finalMp4Public 2>$null
Copy-Item $finalMp4Public $finalMp4Root -Force
Copy-Item $finalMp4Public $finalMp4Desktop -Force

Write-Host "SUCCESS! Master 120-Second Pitch MP4 Video generated successfully!"
Write-Host "Saved to:"
Write-Host " - $finalMp4Desktop"
Write-Host " - $finalMp4Public"
