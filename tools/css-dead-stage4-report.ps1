#Requires -Version 5.1
<#
.SYNOPSIS
  Aşama 4 — /css dosyalarinin boyutu ve kural yogunlugu (kaba { sayisi). Yorum-only / bos adaylari isaretler.
  style.css icindeki gercek olum kurallari ayri arac gerektirir. tools/css-dead-stage4-report.json yazar.

.KULLANIM
  powershell -NoProfile -ExecutionPolicy Bypass -File tools/css-dead-stage4-report.ps1
#>
$ErrorActionPreference = 'Stop'
$repoRoot = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$cssRoot = Join-Path $repoRoot 'css'
$outPath = Join-Path $PSScriptRoot 'css-dead-stage4-report.json'

function Strip-BlockComments([string]$s) {
    [regex]::Replace($s, '/\*.*?\*/', '', 'Singleline')
}

$rows = New-Object System.Collections.Generic.List[object]
Get-ChildItem -LiteralPath $cssRoot -Recurse -Filter '*.css' -File | Sort-Object Name | ForEach-Object {
    $raw = [System.IO.File]::ReadAllText($_.FullName, [System.Text.UTF8Encoding]::new($false))
    $stripped = Strip-BlockComments $raw
    $braceOpen = ([regex]::Matches($stripped, '\{')).Count
    $braceClose = ([regex]::Matches($stripped, '\}')).Count
    $lines = ($raw -split "`n").Count
    $bytes = $_.Length
    $hasRuleBlock = $stripped -match '\{[^}]*:[^}]*\}'
    $stub = (-not $hasRuleBlock) -and ($bytes -lt 400)
    $rel = 'css/' + ($_.FullName.Substring($cssRoot.Length).TrimStart('\').Replace('\', '/'))
    [void]$rows.Add([pscustomobject]@{
        path              = $rel
        bytes             = $bytes
        lines             = $lines
        brace_open_count  = $braceOpen
        brace_close_count = $braceClose
        likely_stub       = [bool]$stub
    })
}

$stage3 = Join-Path $PSScriptRoot 'css-modules-stage3-report.json'
$stage3Note = 'Run tools/css-modules-stage3-inventory.ps1 after href fixes to refresh missing list.'
if (Test-Path -LiteralPath $stage3) {
    try {
        $j = Get-Content -LiteralPath $stage3 -Raw -Encoding UTF8 | ConvertFrom-Json
        $stage3Note = "Last stage3 missing_hrefs_reported: $($j.summary.missing_hrefs_reported). Re-run inventory to refresh."
    }
    catch { }
}

$payload = @{
    schema       = 'global-compass-css-dead-stage4/1'
    generated_at = (Get-Date -Format 'yyyy-MM-ddTHH:mm:ssK')
    summary      = @{
        css_files_on_disk = $rows.Count
        likely_stub_files = ($rows | Where-Object { $_.likely_stub }).Count
    }
    files        = [array]$rows.ToArray()
    stage3_note  = $stage3Note
    notes        = @(
        'likely_stub: no property:block pattern after stripping comments, and file is small — safe extension point or candidate to remove if links are dropped.',
        'Unused selectors inside style.css are not analyzed here (needs HTML token corpus + safer heuristics).'
    )
}

$json = ($payload | ConvertTo-Json -Depth 6)
[System.IO.File]::WriteAllText($outPath, $json + "`n", [System.Text.UTF8Encoding]::new($false))

Write-Host "=== Stage 4 CSS file health (stubs / density) ==="
Write-Host "Wrote: $outPath"
Write-Host "CSS files: $($rows.Count) | Likely stub (comment-only): $(($rows | Where-Object { $_.likely_stub }).Count)"
