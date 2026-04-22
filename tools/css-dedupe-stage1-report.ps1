#Requires -Version 5.1
<#
.SYNOPSIS
  Aşama 1 — style.css içinde aynı bildirim gövdesini paylaşan seçicileri KAPSAM-DUYARLI gruplar (top ayrı, her @media/@supports bloğu ayrı).
  tools/css-dedupe-stage1-report.json yazar. (css-dedupe-analyze.ps1 medya ile top kurallarını karıştırabilir.)

.KULLANIM
  powershell -NoProfile -ExecutionPolicy Bypass -File tools/css-dedupe-stage1-report.ps1
#>
$ErrorActionPreference = 'Stop'
$repoRoot = Split-Path -Parent $PSScriptRoot
$cssPath = Join-Path $repoRoot 'css\style.css'
$outPath = Join-Path $PSScriptRoot 'css-dedupe-stage1-report.json'

function Remove-BlockComments([string]$s) {
    [regex]::Replace($s, '/\*.*?\*/', '', 'Singleline')
}

function Normalize-Decl([string]$decl) {
    $pairs = New-Object System.Collections.Generic.List[string]
    foreach ($part in $decl -split ';') {
        $line = $part.Trim()
        if (-not $line -or $line.IndexOf(':') -lt 0) { continue }
        $idx = $line.IndexOf(':')
        $prop = $line.Substring(0, $idx).Trim().ToLowerInvariant()
        $val = ($line.Substring($idx + 1) -replace '\s+', ' ').Trim()
        [void]$pairs.Add("$prop`:$val")
    }
    ($pairs | Sort-Object) -join '|'
}

function Get-RulesFromBlock([string]$inner) {
    $list = New-Object System.Collections.Generic.List[object]
    $k = 0
    $n = $inner.Length
    while ($k -lt $n) {
        while ($k -lt $n -and [char]::IsWhiteSpace($inner[$k])) { $k++ }
        if ($k -ge $n) { break }
        $selEnd = $inner.IndexOf('{', $k)
        if ($selEnd -lt 0) { break }
        $sel = $inner.Substring($k, $selEnd - $k).Trim()
        if ($sel.StartsWith('@')) { break }
        $depth = 1
        $m = $selEnd + 1
        while ($m -lt $n -and $depth -gt 0) {
            $ch = $inner[$m]
            if ($ch -eq '{') { $depth++ }
            elseif ($ch -eq '}') { $depth-- }
            $m++
        }
        $decl = $inner.Substring($selEnd + 1, $m - $selEnd - 2)
        if ($sel -and $decl.Trim()) {
            [void]$list.Add([pscustomobject]@{ Sel = $sel; Decl = $decl })
        }
        $k = $m
    }
    return ,$list
}

$raw = [System.IO.File]::ReadAllText($cssPath, [System.Text.Encoding]::UTF8)
$text = Remove-BlockComments $raw

$stream = New-Object System.Collections.Generic.List[object]
$topIdx = 0
$i = 0
$n = $text.Length

while ($i -lt $n) {
    while ($i -lt $n -and [char]::IsWhiteSpace($text[$i])) { $i++ }
    if ($i -ge $n) { break }

    if ($text.Substring($i).StartsWith('@import')) {
        $semi = $text.IndexOf(';', $i)
        if ($semi -lt 0) { break }
        $i = $semi + 1
        continue
    }

    if ($text[$i] -eq '@') {
        $j = $i
        while ($j -lt $n -and $text[$j] -ne '{') { $j++ }
        if ($j -ge $n) { break }
        $depth = 1
        $j++
        while ($j -lt $n -and $depth -gt 0) {
            if ($text[$j] -eq '{') { $depth++ }
            elseif ($text[$j] -eq '}') { $depth-- }
            $j++
        }
        $block = $text.Substring($i, $j - $i)
        $trim = $block.TrimStart()
        if ($trim.StartsWith('@media') -or $trim.StartsWith('@supports')) {
            $open = $block.IndexOf('{')
            $hdr = $block.Substring(0, $open).Trim()
            $inner = $block.Substring($open + 1, $block.Length - $open - 2)
            $rules = Get-RulesFromBlock $inner
            [void]$stream.Add([pscustomobject]@{ Kind = 'atmerge'; Header = $hdr; Rules = $rules })
        }
        else {
            [void]$stream.Add([pscustomobject]@{ Kind = 'opaque'; Raw = $block.TrimEnd() })
        }
        $i = $j
        continue
    }

    $selEnd = $text.IndexOf('{', $i)
    if ($selEnd -lt 0) { break }
    $sel = $text.Substring($i, $selEnd - $i).Trim()
    $depth = 1
    $j = $selEnd + 1
    while ($j -lt $n -and $depth -gt 0) {
        if ($text[$j] -eq '{') { $depth++ }
        elseif ($text[$j] -eq '}') { $depth-- }
        $j++
    }
    $decl = $text.Substring($selEnd + 1, $j - $selEnd - 2)
    if ($sel -and $decl.Trim()) {
        [void]$stream.Add([pscustomobject]@{ Kind = 'top'; Sel = $sel; Decl = $decl; Idx = $topIdx })
        $topIdx++
    }
    $i = $j
}

$groups = @{}
function Add-ToGroup([string]$scopeKey, [string]$sel, [string]$decl) {
    $norm = Normalize-Decl $decl
    if (-not $norm) { return }
    $key = $scopeKey + [char]1 + $norm
    if (-not $groups.ContainsKey($key)) {
        $groups[$key] = New-Object System.Collections.Generic.List[string]
    }
    [void]$groups[$key].Add($sel)
}

foreach ($seg in $stream) {
    if ($seg.Kind -eq 'top') {
        Add-ToGroup 'TOP' $seg.Sel $seg.Decl
    }
    elseif ($seg.Kind -eq 'atmerge') {
        $scope = $seg.Header
        foreach ($r in $seg.Rules) {
            Add-ToGroup $scope $r.Sel $r.Decl
        }
    }
}

$dupKeys = $groups.Keys | Where-Object { $groups[$_].Count -ge 2 }
$totalSelectorsInDupGroups = 0
foreach ($k in $dupKeys) {
    $totalSelectorsInDupGroups += $groups[$k].Count
}

$detail = New-Object System.Collections.Generic.List[object]
foreach ($k in $dupKeys) {
    $sels = $groups[$k] | Sort-Object -Unique
    $nSel = $sels.Count
    $sep = $k.IndexOf([char]1)
    $scope = if ($sep -ge 0) { $k.Substring(0, $sep) } else { 'UNKNOWN' }
    $norm = if ($sep -ge 0) { $k.Substring($sep + 1) } else { $k }
    $propCount = ($norm -split '\|').Count
    $preview = if ($norm.Length -gt 120) { $norm.Substring(0, 120) + '...' } else { $norm }
    $sample = @()
    $maxS = [Math]::Min(10, $sels.Count)
    for ($si = 0; $si -lt $maxS; $si++) { $sample += $sels[$si] }
    [void]$detail.Add([pscustomobject]@{
        scope            = $scope
        selector_count   = $nSel
        property_count   = $propCount
        decl_key_preview = $preview
        selectors_sample = $sample
    })
}

$topDetail = $detail | Where-Object { $_.scope -eq 'TOP' } | Sort-Object selector_count -Descending | Select-Object -First 20
$atDetail = $detail | Where-Object { $_.scope -ne 'TOP' } | Sort-Object selector_count -Descending | Select-Object -First 15

$payload = [ordered]@{
    schema       = 'global-compass-css-dedupe-stage1/1'
    generated_at = (Get-Date -Format 'yyyy-MM-ddTHH:mm:ssK')
    source_file  = 'css/style.css'
    summary      = @{
        rules_top_level_segments = ($stream | Where-Object { $_.Kind -eq 'top' }).Count
        at_merge_segments        = ($stream | Where-Object { $_.Kind -eq 'atmerge' }).Count
        opaque_at_segments       = ($stream | Where-Object { $_.Kind -eq 'opaque' }).Count
        duplicate_body_groups    = ($dupKeys | Measure-Object).Count
        selectors_in_dup_groups  = $totalSelectorsInDupGroups
    }
    top_20_by_selector_count   = @($topDetail)
    at_rules_15_largest_groups = @($atDetail)
    merge_tool                 = @{
        script            = 'tools/css-merge-scenario-a.ps1'
        dry_run           = 'powershell -NoProfile -ExecutionPolicy Bypass -File tools/css-merge-scenario-a.ps1 -DryRun'
        warning           = 'Full merge rewrites the file, normalizes declaration formatting, and drops all /* block comments */. Prefer DryRun until a comment-preserving merge exists.'
    }
    analyze_tool               = 'tools/css-dedupe-analyze.ps1'
}

$json = ($payload | ConvertTo-Json -Depth 8)
[System.IO.File]::WriteAllText($outPath, $json + "`n", [System.Text.UTF8Encoding]::new($false))

Write-Host "=== Stage 1 scope-aware duplicate-body report ==="
Write-Host "Wrote: $outPath"
Write-Host "Top-level rule segments:" $payload.summary.rules_top_level_segments
Write-Host "Duplicate-body groups (scope-separated):" $payload.summary.duplicate_body_groups
Write-Host "Selectors sitting in those groups:" $payload.summary.selectors_in_dup_groups
Write-Host "Largest TOP group selector_count:" ($topDetail | Select-Object -First 1 -ExpandProperty selector_count)
