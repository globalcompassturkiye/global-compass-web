#Requires -Version 5.1
<#
.SYNOPSIS
  Aşama 6 — Asama 1-5 rapor scriptlerini sirayla calistirir, istege bagli baseline gunceller,
  istege bagli css-merge-scenario-a.ps1 -DryRun ciktisini dashboarda ekler, sonra dashboard JSON uretir.

.KULLANIM
  powershell -NoProfile -ExecutionPolicy Bypass -File tools/css-stage6-run-all-reports.ps1
  powershell -NoProfile -ExecutionPolicy Bypass -File tools/css-stage6-run-all-reports.ps1 -UpdateBaseline
  powershell -NoProfile -ExecutionPolicy Bypass -File tools/css-stage6-run-all-reports.ps1 -MergeScenarioDryRun
#>
param(
    [switch]$UpdateBaseline,
    [switch]$MergeScenarioDryRun
)
$ErrorActionPreference = 'Stop'
$tools = $PSScriptRoot

function Invoke-RepoScript([string]$name) {
    $path = Join-Path $tools $name
    if (-not (Test-Path -LiteralPath $path)) {
        throw "Missing script: $path"
    }
    Write-Host "--- $name ---" -ForegroundColor Cyan
    & powershell.exe -NoProfile -ExecutionPolicy Bypass -File $path
    if (-not $?) {
        throw "Script failed: $name"
    }
}

if ($UpdateBaseline) {
    Invoke-RepoScript 'update-css-style-baseline.ps1'
}

Invoke-RepoScript 'css-dedupe-stage1-report.ps1'
Invoke-RepoScript 'css-mega-selectors-stage2-report.ps1'
Invoke-RepoScript 'css-modules-stage3-inventory.ps1'
Invoke-RepoScript 'css-dead-stage4-report.ps1'
Invoke-RepoScript 'css-stage5-yas-tab-report.ps1'

$mergeDry = $null
if ($MergeScenarioDryRun) {
    $log = Join-Path $env:TEMP 'gc-css-merge-scenario-a-dryrun.txt'
    & powershell.exe -NoProfile -ExecutionPolicy Bypass -File (Join-Path $tools 'css-merge-scenario-a.ps1') -DryRun *> $log
    if (-not $?) {
        throw 'css-merge-scenario-a.ps1 -DryRun failed'
    }
    $tail = Get-Content -LiteralPath $log -Raw -Encoding UTF8
    $lineDelta = $null
    $byteDelta = $null
    if ($tail -match 'delta:\s*(-?\d+)') { } # weak
    if ($tail -match 'Satir:\s*\d+\s*->\s*\d+\s*\(delta:\s*(-?\d+)\)') {
        $lineDelta = [int]$Matches[1]
    }
    if ($tail -match 'Bayt:\s*\d+\s*->\s*\d+\s*\(delta:\s*(-?\d+)\)') {
        $byteDelta = [int]$Matches[1]
    }
    $mergeDry = @{
        log_file_tail_chars = [Math]::Min(2000, $tail.Length)
        line_delta          = $lineDelta
        byte_delta          = $byteDelta
        warning             = 'Full merge strips block comments; use for sizing estimate only.'
    }
}

Invoke-RepoScript 'css-stage6-build-dashboard.ps1'

if ($mergeDry) {
    $dashPath = Join-Path $tools 'css-stage6-dashboard.json'
    $d = Get-Content -LiteralPath $dashPath -Raw -Encoding UTF8 | ConvertFrom-Json
    $d | Add-Member -NotePropertyName merge_scenario_a_dry_run -NotePropertyValue $mergeDry -Force
    $json = ($d | ConvertTo-Json -Depth 8)
    [System.IO.File]::WriteAllText($dashPath, $json + "`n", [System.Text.UTF8Encoding]::new($false))
    Write-Host "Appended merge_scenario_a_dry_run to dashboard." -ForegroundColor Green
}

Write-Host "Done. Dashboard: tools/css-stage6-dashboard.json" -ForegroundColor Green
