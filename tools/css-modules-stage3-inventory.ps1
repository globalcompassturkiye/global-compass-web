#Requires -Version 5.1
<#
.SYNOPSIS
  Aşama 3 — HTML sayfalarindaki yerel stylesheet href envanteri: dosya basina referans sayisi,
  eksik dosya uyarısı, /css altinda hiç referans edilmeyen dosyalar. tools/css-modules-stage3-report.json yazar.

.KULLANIM
  powershell -NoProfile -ExecutionPolicy Bypass -File tools/css-modules-stage3-inventory.ps1
#>
param(
    [string[]]$HtmlGlobDirs = @('blog', 'hakkimizda', 'hizmetlerimiz', 'iletisim', 'payment', 'payment-failed', 'payment-ok', 'sss', 'yurt-disi-burs-firsatlari', 'yurt-disi-dil-okullari', 'yurt-disi-lise', 'yurt-disi-online-egitim', 'yurt-disi-universite', 'yurt-disi-yaz-okullari', 'yurt-disi-yuksek-lisans-mba', 'kvkk-aydinlatma-metni', 'kvkk-acik-riza-metni', 'gizlilik-politikasi', 'cerez-aydinlatma-metni')
)
$ErrorActionPreference = 'Stop'
$repoRoot = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$cssRoot = Join-Path $repoRoot 'css'
$outPath = Join-Path $PSScriptRoot 'css-modules-stage3-report.json'

function Get-StylesheetHrefs([string]$html) {
    $set = New-Object 'System.Collections.Generic.HashSet[string]'
    $patterns = @(
        'rel\s*=\s*["'']stylesheet["''][^>]*?\bhref\s*=\s*["'']([^"'']+)["'']',
        '\bhref\s*=\s*["'']([^"'']+)["''][^>]*rel\s*=\s*["'']stylesheet["'']'
    )
    foreach ($p in $patterns) {
        foreach ($m in [regex]::Matches($html, $p, [System.Text.RegularExpressions.RegexOptions]::IgnoreCase)) {
            $v = $m.Groups[1].Value.Trim()
            if ($v -match '\.css') { [void]$set.Add($v) }
        }
    }
    return @($set)
}

function Normalize-RepoRel([string]$absPath) {
    $p = $absPath.Substring($repoRoot.Length).TrimStart('\', '/')
    return ($p -replace '\\', '/')
}

function Resolve-HrefToFull([string]$href, [string]$htmlDirAbs) {
    $h = $href.Trim() -replace '\?.*$', ''
    if ($h -match '^\s*https?://') { return @{ kind = 'external_http'; raw = $h } }
    if ($h -match '^\s*//') { return @{ kind = 'external_protocol_relative'; raw = $h } }
    if ($h.StartsWith('/')) {
        $tail = $h.TrimStart('/').Replace('/', [System.IO.Path]::DirectorySeparatorChar)
        return @{ kind = 'local'; full = [System.IO.Path]::GetFullPath((Join-Path $repoRoot $tail)) }
    }
    $rel = $h.Replace('/', [System.IO.Path]::DirectorySeparatorChar)
    $combined = [System.IO.Path]::GetFullPath((Join-Path $htmlDirAbs $rel))
    if (-not $combined.StartsWith($repoRoot, [StringComparison]::OrdinalIgnoreCase)) {
        return @{ kind = 'outside_repo'; full = $combined }
    }
    return @{ kind = 'local'; full = $combined }
}

$htmlFiles = New-Object System.Collections.Generic.List[string]
$htmlFiles.Add((Join-Path $repoRoot 'index.html'))
foreach ($d in $HtmlGlobDirs) {
    $base = Join-Path $repoRoot $d
    if (-not (Test-Path -LiteralPath $base)) { continue }
    Get-ChildItem -LiteralPath $base -Recurse -Filter 'index.html' -File -ErrorAction SilentlyContinue | ForEach-Object {
        [void]$htmlFiles.Add($_.FullName)
    }
}
# Tekil (tek dosyada dizi kalsin; yoksa string karakterleri uzerinde doner)
$htmlFiles = @($htmlFiles | Sort-Object -Unique)

$refCounts = @{}
$missing = New-Object System.Collections.Generic.List[object]
$external = New-Object System.Collections.Generic.List[string]
$signatures = @{}

foreach ($fp in $htmlFiles) {
    $htmlDir = [System.IO.Path]::GetDirectoryName($fp)
    $raw = [System.IO.File]::ReadAllText($fp, [System.Text.UTF8Encoding]::new($false))
    $hrefs = Get-StylesheetHrefs $raw
    $localRels = New-Object System.Collections.Generic.List[string]
    foreach ($h in $hrefs) {
        $res = Resolve-HrefToFull $h $htmlDir
        if ($res.kind -eq 'external_http' -or $res.kind -eq 'external_protocol_relative') {
            if ($res.raw -notmatch 'fonts\.googleapis\.com') {
                [void]$external.Add($res.raw)
            }
            continue
        }
        if ($res.kind -eq 'outside_repo') {
            [void]$missing.Add([pscustomobject]@{ page = (Normalize-RepoRel $fp); href = $h; reason = 'outside_repo' })
            continue
        }
        $full = $res.full
        if (-not ($full -like '*.css')) { continue }
        if (-not (Test-Path -LiteralPath $full)) {
            [void]$missing.Add([pscustomobject]@{ page = (Normalize-RepoRel $fp); href = $h; resolved = (Normalize-RepoRel $full); reason = 'file_not_found' })
            continue
        }
        $rel = (Normalize-RepoRel $full).ToLowerInvariant()
        if (-not $refCounts.ContainsKey($rel)) { $refCounts[$rel] = 0 }
        $refCounts[$rel]++
        [void]$localRels.Add($rel)
    }
    $sig = ($localRels | Sort-Object -Unique) -join '|'
    if (-not $signatures.ContainsKey($sig)) { $signatures[$sig] = 0 }
    $signatures[$sig]++
}

$onDisk = @(Get-ChildItem -LiteralPath $cssRoot -Recurse -Filter '*.css' -File | ForEach-Object { (Normalize-RepoRel $_.FullName).ToLowerInvariant() })
$referencedKeys = @($refCounts.Keys | ForEach-Object { $_.ToLowerInvariant() })
$orphan = @($onDisk | Where-Object { $referencedKeys -notcontains $_ })

$sheetRows = New-Object System.Collections.Generic.List[object]
foreach ($kv in @($refCounts.GetEnumerator() | Sort-Object { $_.Value } -Descending)) {
    $p = Join-Path $repoRoot ($kv.Key -replace '/', [System.IO.Path]::DirectorySeparatorChar)
    $bytes = if (Test-Path -LiteralPath $p) { (Get-Item -LiteralPath $p).Length } else { $null }
    [void]$sheetRows.Add([pscustomobject]@{
        path        = $kv.Key
        ref_count   = $kv.Value
        bytes       = $bytes
    })
}

$topSigs = @($signatures.GetEnumerator() | Sort-Object Value -Descending | Select-Object -First 12 | ForEach-Object {
    [pscustomobject]@{
        page_count = $_.Value
        signature  = if ($_.Key.Length -gt 500) { $_.Key.Substring(0, 500) + '...' } else { $_.Key }
    }
})

$payload = @{
    schema                = 'global-compass-css-modules-stage3/1'
    generated_at          = (Get-Date -Format 'yyyy-MM-ddTHH:mm:ssK')
    summary               = @{
        html_files_scanned         = $htmlFiles.Count
        unique_local_sheets_linked = $refCounts.Count
        missing_hrefs_reported     = $missing.Count
        css_files_on_disk          = $onDisk.Count
        unreferenced_css_on_disk   = $orphan.Count
    }
    sheets_by_ref_count   = [array]$sheetRows.ToArray()
    missing_or_bad        = [array]$missing.ToArray()
    unreferenced_css      = [array]$orphan
    top_link_signatures   = [array]$topSigs
    notes                 = @(
        'Only <link rel=stylesheet href=...> in scanned HTML; @import inside CSS (e.g. site-cls-rezerv.css) is not attributed to pages here.',
        'Prefer /css/... root paths in new pages per css-klasor-standardi.'
    )
}

$json = ($payload | ConvertTo-Json -Depth 8)
[System.IO.File]::WriteAllText($outPath, $json + "`n", [System.Text.UTF8Encoding]::new($false))

Write-Host "=== Stage 3 CSS module inventory ==="
Write-Host "Wrote: $outPath"
Write-Host "HTML files: $($htmlFiles.Count) | Unique local sheets: $($refCounts.Count) | Missing: $($missing.Count) | Unreferenced under css/: $($orphan.Count)"
