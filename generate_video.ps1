Add-Type -AssemblyName System.Drawing
Add-Type -AssemblyName System.Speech

$workDir = "D:\Projects\truvexa-ai\video_assets"
if (!(Test-Path $workDir)) {
    New-Item -ItemType Directory -Path $workDir -Force | Out-Null
}

Write-Host "1. Rendering High-Definition 1080p Video Scene Frames..."

function Create-Scene-Frame {
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
        [string]$sceneNumber
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

    # Watermark Brand
    $fontBrand = New-Object System.Drawing.Font("Arial", 22, [System.Drawing.FontStyle]::Bold)
    $g.DrawString("TRUVEXA", $fontBrand, $whiteBrush, 70, 50)
    $g.DrawString("AI", $fontBrand, $cyanBrush, 220, 50)
    $fontSub = New-Object System.Drawing.Font("Consolas", 12, [System.Drawing.FontStyle]::Regular)
    $g.DrawString("EVERY CLAIM DESERVES EVIDENCE", $fontSub, $slateBrush, 72, 85)

    # Scene Tracker on Top-Right
    $fontScene = New-Object System.Drawing.Font("Consolas", 15, [System.Drawing.FontStyle]::Bold)
    $g.DrawString($sceneNumber, $fontScene, $cyanBrush, 1550, 60)

    # Badge Pill
    $fontBadge = New-Object System.Drawing.Font("Arial", 14, [System.Drawing.FontStyle]::Bold)
    $pillBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(10, 35, 65))
    $g.FillRectangle($pillBrush, 70, 160, 520, 38)
    $g.DrawRectangle($cyanPen, 70, 160, 520, 38)
    $g.DrawString($badgeText, $fontBadge, $cyanBrush, 90, 168)

    # Main Title
    $fontTitle = New-Object System.Drawing.Font("Arial", 40, [System.Drawing.FontStyle]::Bold)
    $g.DrawString($mainTitle, $fontTitle, $whiteBrush, 70, 220)

    # Subtitle
    $fontDesc = New-Object System.Drawing.Font("Arial", 20, [System.Drawing.FontStyle]::Regular)
    $g.DrawString($subtitle, $fontDesc, $slateBrush, 70, 290)

    # Two Main Graphic Cards
    $cardBg = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(11, 31, 56))
    $cardPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(37, 99, 235), 2)
    $cardCyanPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(0, 212, 255), 2)

    # Left Box
    $g.FillRectangle($cardBg, 70, 370, 850, 490)
    $g.DrawRectangle($cardPen, 70, 370, 850, 490)

    $fontCardHead = New-Object System.Drawing.Font("Arial", 22, [System.Drawing.FontStyle]::Bold)
    $g.DrawString($leftBoxHeader, $fontCardHead, $cyanBrush, 105, 405)

    $fontCardText = New-Object System.Drawing.Font("Arial", 16, [System.Drawing.FontStyle]::Regular)
    $yPos = 470
    foreach ($line in $leftBoxLines) {
        $g.DrawString($line, $fontCardText, $whiteBrush, 105, $yPos)
        $yPos += 45
    }

    # Right Box
    $g.FillRectangle($cardBg, 980, 370, 870, 490)
    $g.DrawRectangle($cardCyanPen, 980, 370, 870, 490)

    $g.DrawString($rightBoxHeader, $fontCardHead, $greenBrush, 1015, 405)
    $yPosR = 470
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

# Scene 1 Parameters
$p1 = @{
    outputPath = "$workDir\scene1.png"
    badgeText = "AI DOCUMENT INTELLIGENCE PLATFORM"
    mainTitle = "TRUVEXA AI - Every Claim Deserves Evidence"
    subtitle = "Transforming multi-page corporate filings into trusted, auditable facts."
    leftBoxHeader = "The Core Problem in Corporate Filings"
    leftBoxLines = @(
        "- Unverified assertions and phantom figures in reports",
        "- Undetected contradictions between fiscal periods",
        "- Inconsistent project budgets and timeline shifts",
        "- Generative AI models hallucinating fabricated citations",
        "- High risk of costly mistakes in executive due diligence"
    )
    rightBoxHeader = "The TRUVEXA AI Solution"
    rightBoxLines = @(
        "[OK] Source-Grounded Verification with zero hallucinations",
        "[OK] Cross-Document Contradiction Explorer",
        "[OK] Automated multi-PDF ingestion and vector indexing",
        "[OK] Clickable line-level citations linking to verified PDF pages",
        "[OK] Exportable Intelligence Reports in CSV and PDF"
    )
    footerText = "TRUVEXA AI - BUILT FOR HIGH-STAKES FINANCIAL AND REGULATORY AUDITS"
    sceneNumber = "SCENE 01 / 05 [00:00 - 00:12]"
}
Create-Scene-Frame @p1

# Scene 2 Parameters
$p2 = @{
    outputPath = "$workDir\scene2.png"
    badgeText = "PIPELINE STAGE 1: INGESTION AND PARSING"
    mainTitle = "Multi-PDF Upload and Page-Level Chunking"
    subtitle = "Batch ingest up to 10 filings simultaneously with full coordinate preservation."
    leftBoxHeader = "Uploaded Filing Corpus"
    leftBoxLines = @(
        "1. ApexCorp_Annual_Report_2024.pdf (3 Pages, 3 Chunks)",
        "2. ApexCorp_Strategic_Review_2025.pdf (3 Pages, 3 Chunks)",
        "3. CloudScale_Security_Policy.pdf (2 Pages, 2 Chunks)",
        "- Automatic format validation and size inspection",
        "- Scanned page fallback with clean OCR integration"
    )
    rightBoxHeader = "Vector Indexing Architecture"
    rightBoxLines = @(
        "[OK] Overlapping semantic text splitting (380-word windows)",
        "[OK] Exact document name and page number coordinate tagging",
        "[OK] High-accuracy vector embeddings stored in PostgreSQL / pgvector",
        "[OK] Live processing states: Extracting -> Chunking -> Ready",
        "[OK] Zero phantom facts injected during tokenization"
    )
    footerText = "ZERO-HALLUCINATION EMBEDDING PIPELINE - AUDITABLE PAGE COORDINATES"
    sceneNumber = "SCENE 02 / 05 [00:12 - 00:24]"
}
Create-Scene-Frame @p2

# Scene 3 Parameters
$p3 = @{
    outputPath = "$workDir\scene3.png"
    badgeText = "CORE DIFFERENTIATOR: CONTRADICTION ENGINE"
    mainTitle = "Cross-Document Contradiction Explorer"
    subtitle = "Flagging revenue mismatches, budget escalations, and timeline shifts side by side."
    leftBoxHeader = "Document A: Annual_Report_2024.pdf"
    leftBoxLines = @(
        "- Page 1 Assertion: Total reported annual revenue was 120 Crore.",
        "- Page 2 Assertion: Allocated budget for Project Titan is 15 Crore.",
        "- Page 3 Assertion: Commercial launch scheduled for Q2 2025.",
        "- Status: Primary fiscal disclosure signed off by audit board."
    )
    rightBoxHeader = "Document B: Strategic_Review_2025.pdf"
    rightBoxLines = @(
        "- Page 1 Conflict: Reconciled 2024 revenue certified at 105 Crore.",
        "- Page 2 Conflict: Project Titan budget escalated to 22 Crore.",
        "- Page 3 Conflict: Target launch rescheduled to Q4 2025.",
        "[OK] Review Actions: [Mark Confirmed] [Mark Resolved] [Add Note]"
    )
    footerText = "AUTOMATIC ENTITY, DATE AND NUMERICAL CONFLICT AUDITING BETWEEN FILINGS"
    sceneNumber = "SCENE 03 / 05 [00:24 - 00:36]"
}
Create-Scene-Frame @p3

# Scene 4 Parameters
$p4 = @{
    outputPath = "$workDir\scene4.png"
    badgeText = "PIPELINE STAGE 3: CLAIM VERIFICATION"
    mainTitle = "Factual Assessment and Citation Highlighting"
    subtitle = "Verify arbitrary assertions with instant navigation into verified PDF pages."
    leftBoxHeader = "Input Claim Verification"
    leftBoxLines = @(
        "Assertion: 'The company annual revenue reached 120 Crore in 2024.'",
        "Classification: [SUPPORTED BY EVIDENCE]",
        "AI Rationale: Statement conforms with primary filing on Page 1.",
        "Missing Context: None. Exact figures matched in text corpus.",
        "Recommended Check: Cross-verify subsequent deferred credit adjustments."
    )
    rightBoxHeader = "Integrated PDF Viewer with Passage Highlight"
    rightBoxLines = @(
        "[OK] Clicking citation opens exact PDF file and jumps to Page 1",
        "[OK] Yellow passage highlight: 'Total reported revenue reached 120 Cr...'",
        "[OK] Zoom in / Zoom out controls (75 percent to 150 percent)",
        "[OK] In-document keyword search across active document pages",
        "[OK] Full transparency: No unverified claims accepted"
    )
    footerText = "VERIFIABLE AUDIT TRAILS - INSTANT CITATION JUMP WITH PASSAGE HIGHLIGHTING"
    sceneNumber = "SCENE 04 / 05 [00:36 - 00:48]"
}
Create-Scene-Frame @p4

# Scene 5 Parameters
$p5 = @{
    outputPath = "$workDir\scene5.png"
    badgeText = "ENTERPRISE GRADE - PRODUCTION DEPLOYMENT"
    mainTitle = "Topological Evidence Graph and Reports"
    subtitle = "Interactive relationship visualizer and 1-click exportable intelligence dossiers."
    leftBoxHeader = "Interactive Evidence Graph"
    leftBoxLines = @(
        "- Blue Nodes: Scanned PDF Filings",
        "- Green Nodes: Verified Corroborated Claims",
        "- Red Nodes: Flagged Cross-Document Contradictions",
        "- Visual Edges: [Supports] and [Contradicts] relationships",
        "- Interactive canvas with pan, zoom, and node inspector drawer"
    )
    rightBoxHeader = "Defensible Evidence Intelligence Reports"
    rightBoxLines = @(
        "[OK] Executive summary and key discrepancy findings",
        "[OK] Complete reconciliation tables with source page references",
        "[OK] 1-Click Export to CSV Spreadsheet format",
        "[OK] 1-Click Print / PDF generation for executive presentations",
        "[OK] Live on http://localhost:3000 and GitHub Repository"
    )
    footerText = "TRUVEXA AI - EVERY CLAIM DESERVES EVIDENCE - LIVE AND FULLY FUNCTIONAL"
    sceneNumber = "SCENE 05 / 05 [00:48 - 01:00]"
}
Create-Scene-Frame @p5

Write-Host "2. Synthesizing Synchronized Speech Voiceover Audio..."

$narrations = @(
    "Welcome to TRUVEXA AI. When making high stakes decisions from dense reports, organizations frequently suffer from contradictory figures and unverified assertions.",
    "TRUVEXA AI solves this. Upload multiple PDFs simultaneously. Our engine parses pages, preserves coordinates, and indexes vector chunks with zero hallucinations.",
    "Our flagship Contradiction Explorer automatically flags cross document discrepancies, comparing revenue figures, budgets, and timelines side by side with line citations.",
    "Test any factual statement in the Claim Verification Engine. Every verdict links directly to verified PDF pages, with instant jump to page citation highlighting.",
    "Explore the interactive evidence graph, and export comprehensive audit intelligence reports to PDF or CSV. TRUVEXA AI: Every claim deserves evidence."
)

$synth = New-Object System.Speech.Synthesis.SpeechSynthesizer
$synth.Rate = 0

for ($i = 0; $i -lt 5; $i++) {
    $idx = $i + 1
    $wavPath = "$workDir\audio$idx.wav"
    $synth.SetOutputToWaveFile($wavPath)
    $synth.Speak($narrations[$i])
}
$synth.Dispose()

Write-Host "3. Encoding 60-Second Video Clips with FFmpeg..."
$ffmpeg = "C:\Users\Danisha R\AppData\Local\Microsoft\WinGet\Packages\Gyan.FFmpeg.Essentials_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-9.0.1-essentials_build\bin\ffmpeg.exe"

for ($i = 1; $i -le 5; $i++) {
    $img = "$workDir\scene$i.png"
    $aud = "$workDir\audio$i.wav"
    $outClip = "$workDir\clip$i.mp4"
    
    # 12 seconds per clip: pad audio to 12s so each clip is exactly 12.0s
    & $ffmpeg -y -loop 1 -i $img -i $aud -af "apad=whole_dur=12" -c:v libx264 -t 12 -pix_fmt yuv420p -c:a aac -b:a 192k $outClip 2>$null
}

# Concat file list
$concatFile = "$workDir\concat.txt"
"file '$workDir\clip1.mp4'`nfile '$workDir\clip2.mp4'`nfile '$workDir\clip3.mp4'`nfile '$workDir\clip4.mp4'`nfile '$workDir\clip5.mp4'" | Set-Content -Path $concatFile -Encoding Ascii

$finalMp4Public = "D:\Projects\truvexa-ai\public\TRUVEXA_AI_60s_Explainer.mp4"
$finalMp4Root = "D:\Projects\truvexa-ai\TRUVEXA_AI_60s_Explainer.mp4"
$finalMp4Downloads = "C:\Users\Danisha R\Downloads\TRUVEXA_AI_60s_Explainer.mp4"

Write-Host "4. Concatenating into Master 60-Second Video..."
& $ffmpeg -y -f concat -safe 0 -i $concatFile -c copy $finalMp4Public 2>$null
Copy-Item $finalMp4Public $finalMp4Root -Force
Copy-Item $finalMp4Public $finalMp4Downloads -Force

Write-Host "SUCCESS! Master 60-Second MP4 Video generated successfully!"
