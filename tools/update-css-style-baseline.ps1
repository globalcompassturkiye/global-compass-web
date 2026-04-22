<#
.SYNOPSIS
  css/style.css icin Aşama 0 baseline olcumunu tools/css-style-baseline.json dosyasina yazar.
  Mevcut JSON UTF-8 olarak okunur; policy/notes korunur, yalnizca olcum alanlari guncellenir.

.KULLANIM
  repo kokunden:
  powershell -NoProfile -ExecutionPolicy Bypass -File tools/update-css-style-baseline.ps1
  veya: pwsh -File tools/update-css-style-baseline.ps1
#>
$ErrorActionPreference = 'Stop'
$repoRoot = Split-Path -Parent $PSScriptRoot
$cssPath = Join-Path $repoRoot 'css\style.css'
$outPath = Join-Path $PSScriptRoot 'css-style-baseline.json'

if (-not (Test-Path -LiteralPath $cssPath)) {
    Write-Error "Not found: $cssPath"
}

$item = Get-Item -LiteralPath $cssPath
$bytes = $item.Length
$lines = (Get-Content -LiteralPath $cssPath | Measure-Object -Line).Lines

Push-Location $repoRoot
try {
    $commit = (git rev-parse HEAD 2>$null)
    if (-not $commit) { $commit = 'unknown' }
    $dirty = $false
    $porcelain = git status --porcelain 2>$null
    if ($porcelain) { $dirty = $true }
    $clean = -not $dirty
}
finally {
    Pop-Location
}

if (Test-Path -LiteralPath $outPath) {
    $raw = Get-Content -LiteralPath $outPath -Raw -Encoding UTF8
    $obj = $raw | ConvertFrom-Json
} else {
    $obj = [pscustomobject]@{
        schema     = 'global-compass-css-baseline/1'
        file       = 'css/style.css'
        policy     = @{
            yeni_sayfa_css = '.cursor/rules/yeni-sayfa-ek-css-yasagi.mdc'
            summary        = 'See rule file; new pages should not add selectors to style.css by default.'
        }
        notes      = @('Stage 0 baseline. Edit this file for Turkish policy text, then re-run script.')
    }
}

$obj.measured_at = (Get-Date -Format 'yyyy-MM-ddTHH:mm:ssK')
$obj.bytes = $bytes
$obj.lines = $lines
$obj.git_commit = $commit
$obj.working_tree_clean = $clean
if (-not $obj.file) { $obj | Add-Member -NotePropertyName file -NotePropertyValue 'css/style.css' -Force }
if (-not $obj.schema) { $obj | Add-Member -NotePropertyName schema -NotePropertyValue 'global-compass-css-baseline/1' -Force }
$obj.update_command = 'powershell -NoProfile -ExecutionPolicy Bypass -File tools/update-css-style-baseline.ps1'
$obj | Add-Member -NotePropertyName update_command_pwsh -NotePropertyValue 'pwsh -File tools/update-css-style-baseline.ps1' -Force

$json = ($obj | ConvertTo-Json -Depth 10)
[System.IO.File]::WriteAllText($outPath, $json + "`n", [System.Text.UTF8Encoding]::new($false))

$short = if ($commit.Length -ge 7) { $commit.Substring(0, 7) } else { $commit }
Write-Host "Wrote: $outPath"
Write-Host "  bytes=$bytes lines=$lines commit=$short working_tree_clean=$clean"
