#Requires -Version 5.1
<#
.SYNOPSIS
  Aşama 6 — tools altindaki css-style-baseline.json ve asama 1-5 raporlarindan tek bir dashboard JSON uretir.
  (Raporlari yenilemek icin css-stage6-run-all-reports.ps1 kullanin.)

.KULLANIM
  powershell -NoProfile -ExecutionPolicy Bypass -File tools/css-stage6-build-dashboard.ps1
#>
$ErrorActionPreference = 'Stop'
$tools = $PSScriptRoot
$outPath = Join-Path $tools 'css-stage6-dashboard.json'

function Read-JsonFile([string]$relativeName) {
    $p = Join-Path $tools $relativeName
    if (-not (Test-Path -LiteralPath $p)) {
        return $null
    }
    return (Get-Content -LiteralPath $p -Raw -Encoding UTF8 | ConvertFrom-Json)
}

$baseline = Read-JsonFile 'css-style-baseline.json'
$s1 = Read-JsonFile 'css-dedupe-stage1-report.json'
$s2 = Read-JsonFile 'css-mega-selectors-stage2-report.json'
$s3 = Read-JsonFile 'css-modules-stage3-report.json'
$s4 = Read-JsonFile 'css-dead-stage4-report.json'
$s5 = Read-JsonFile 'css-stage5-yas-tab-report.json'

$dash = @{
    schema       = 'global-compass-css-stage6-dashboard/1'
    generated_at = (Get-Date -Format 'yyyy-MM-ddTHH:mm:ssK')
    sources      = @{
        baseline = 'tools/css-style-baseline.json'
        stage1   = 'tools/css-dedupe-stage1-report.json'
        stage2   = 'tools/css-mega-selectors-stage2-report.json'
        stage3   = 'tools/css-modules-stage3-report.json'
        stage4   = 'tools/css-dead-stage4-report.json'
        stage5   = 'tools/css-stage5-yas-tab-report.json'
    }
    baseline_snapshot = if ($baseline) {
        @{
            file         = $baseline.file
            measured_at  = $baseline.measured_at
            bytes        = $baseline.bytes
            lines        = $baseline.lines
            git_commit   = $baseline.git_commit
        }
    }
    else { $null }
    stage1_dedupe_scope = if ($s1) { $s1.summary } else { $null }
    stage2_mega         = if ($s2) { $s2.summary } else { $null }
    stage3_modules      = if ($s3) { $s3.summary } else { $null }
    stage4_file_health  = if ($s4) { $s4.summary } else { $null }
    stage5_yas_tab      = if ($s5) {
        @{
            html_summary  = $s5.html_summary
            mirror_status = $s5.mirror_status
        }
    }
    else { $null }
    next_work_hints     = @(
        'Comment-preserving duplicate merge for style.css (avoid css-merge-scenario-a until parser preserves /* */).',
        'Reduce mega selectors listed in css-mega-selectors-stage2-report.json (payment / yas :checked chains).',
        'Re-run this dashboard after substantive CSS edits: tools/css-stage6-run-all-reports.ps1'
    )
}

$json = ($dash | ConvertTo-Json -Depth 8)
[System.IO.File]::WriteAllText($outPath, $json + "`n", [System.Text.UTF8Encoding]::new($false))

Write-Host "Wrote: $outPath"
