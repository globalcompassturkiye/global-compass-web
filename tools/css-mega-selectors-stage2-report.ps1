#Requires -Version 5.1
<#
.SYNOPSIS
  Aşama 2 — style.css icinde "mega" secicileri olcer: karakter uzunlugu, virgul ile birlestirilmis liste boyutu,
  body.sayfa-* ve #id ipuclari. tools/css-mega-selectors-stage2-report.json uretir.
  (Aşama 1 ile ayni parser: TOP ve her @media/@supports blogu ayri scope.)

.KULLANIM
  powershell -NoProfile -ExecutionPolicy Bypass -File tools/css-mega-selectors-stage2-report.ps1
#>
param(
    [int]$LongCharsThreshold = 180,
    [int]$HeavyCommaThreshold = 8
)
$ErrorActionPreference = 'Stop'
$repoRoot = Split-Path -Parent $PSScriptRoot
$cssPath = Join-Path $repoRoot 'css\style.css'
$outPath = Join-Path $PSScriptRoot 'css-mega-selectors-stage2-report.json'

function Remove-BlockComments([string]$s) {
    [regex]::Replace($s, '/\*.*?\*/', '', 'Singleline')
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

function Measure-Selector([string]$scope, [string]$rawSel) {
    $one = ($rawSel -replace '\s+', ' ').Trim()
    $commaCount = ([regex]::Matches($one, ',')).Count
    $listParts = if ($commaCount -ge 0) { $commaCount + 1 } else { 1 }
    $childOrSibling = ([regex]::Matches($one, '\s+[>+~]\s+')).Count
    $hasBodySayfa = $one -match 'body\.sayfa-'
    $hasHashId = $one -match '#[A-Za-z0-9_-]+'
    $pain = $one.Length + ($commaCount * 28) + ($childOrSibling * 6)
    [pscustomobject]@{
        scope              = $scope
        char_len           = $one.Length
        comma_count        = $commaCount
        list_part_count    = $listParts
        combinator_hops    = $childOrSibling
        has_body_sayfa     = [bool]$hasBodySayfa
        has_hash_id        = [bool]$hasHashId
        pain_score         = $pain
        preview            = if ($one.Length -le 220) { $one } else { $one.Substring(0, 220) + '...' }
    }
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

$rows = New-Object System.Collections.Generic.List[object]
foreach ($seg in $stream) {
    if ($seg.Kind -eq 'top') {
        [void]$rows.Add((Measure-Selector 'TOP' $seg.Sel))
    }
    elseif ($seg.Kind -eq 'atmerge') {
        foreach ($r in $seg.Rules) {
            [void]$rows.Add((Measure-Selector $seg.Header $r.Sel))
        }
    }
}

$total = $rows.Count
$longC = ($rows | Where-Object { $_.char_len -ge $LongCharsThreshold }).Count
$heavyC = ($rows | Where-Object { $_.comma_count -ge $HeavyCommaThreshold }).Count
$both = ($rows | Where-Object { $_.char_len -ge $LongCharsThreshold -and $_.comma_count -ge $HeavyCommaThreshold }).Count
$bodySayfa = ($rows | Where-Object { $_.has_body_sayfa }).Count
$hashId = ($rows | Where-Object { $_.has_hash_id }).Count

$buckets = [ordered]@{
    'len_0_80'    = ($rows | Where-Object { $_.char_len -le 80 }).Count
    'len_81_120'  = ($rows | Where-Object { $_.char_len -ge 81 -and $_.char_len -le 120 }).Count
    'len_121_180' = ($rows | Where-Object { $_.char_len -ge 121 -and $_.char_len -le 180 }).Count
    'len_181_240' = ($rows | Where-Object { $_.char_len -ge 181 -and $_.char_len -le 240 }).Count
    'len_241_plus' = ($rows | Where-Object { $_.char_len -ge 241 }).Count
}

$topPain = $rows | Sort-Object pain_score -Descending | Select-Object -First 35
$topLen = $rows | Sort-Object char_len -Descending | Select-Object -First 25
$topComma = $rows | Sort-Object comma_count, char_len -Descending | Select-Object -First 25

$payload = [ordered]@{
    schema                 = 'global-compass-css-mega-selectors-stage2/1'
    generated_at           = (Get-Date -Format 'yyyy-MM-ddTHH:mm:ssK')
    source_file            = 'css/style.css'
    thresholds             = @{
        long_chars_min  = $LongCharsThreshold
        heavy_comma_min = $HeavyCommaThreshold
    }
    summary                = @{
        rules_scanned              = $total
        long_selector_rules        = $longC
        heavy_comma_list_rules     = $heavyC
        long_and_heavy_rules       = $both
        rules_with_body_sayfa_hint = $bodySayfa
        rules_with_hash_id_hint    = $hashId
    }
    length_distribution    = $buckets
    top_by_pain_score      = @($topPain)
    top_by_char_length     = @($topLen)
    top_by_comma_count     = @($topComma)
    policy                 = @{
        override_rule = '.cursor/rules/override-yasagi-ortak-stil-sozlesmesi.mdc'
        hint          = 'Prefer shared layout classes (cerceve-kutu, rozet-grid) and shorter hooks over long body.sayfa-* chains; merge duplicate lists only when cascade-safe (see stage 1).'
    }
}

$json = ($payload | ConvertTo-Json -Depth 6)
[System.IO.File]::WriteAllText($outPath, $json + "`n", [System.Text.UTF8Encoding]::new($false))

Write-Host "=== Stage 2 mega-selector report ==="
Write-Host "Wrote: $outPath"
Write-Host "Rules scanned: $total"
Write-Host "Long (>=$LongCharsThreshold chars): $longC | Heavy comma (>=$HeavyCommaThreshold): $heavyC | Both: $both"
Write-Host "body.sayfa-* in selector: $bodySayfa | #id in selector: $hashId"
