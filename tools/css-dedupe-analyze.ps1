#Requires -Version 5.1
$ErrorActionPreference = 'Stop'
$path = Join-Path $PSScriptRoot '..\css\style.css'
$raw = [System.IO.File]::ReadAllText($path, [System.Text.Encoding]::UTF8)

# Strip block comments
$text = [regex]::Replace($raw, '/\*.*?\*/', '', 'Singleline')

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
            $list.Add(@($sel, $decl))
        }
        $k = $m
    }
    return $list
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
    $arr = $pairs | Sort-Object
    return ($arr -join '|')
}

function Rough-Lines([string]$sel, [int]$propCount) {
    $wrap = [math]::Max(1, [int]([math]::Ceiling($sel.Length / 110.0)))
    return $wrap + 1 + $propCount + 1
}

$allRules = New-Object System.Collections.Generic.List[object]

$i = 0
$n = $text.Length
while ($i -lt $n) {
    $ch = $text[$i]
    if ([char]::IsWhiteSpace($ch)) { $i++; continue }
    if ($text.Substring($i).StartsWith('@import')) {
        $semi = $text.IndexOf(';', $i)
        if ($semi -lt 0) { break }
        $i = $semi + 1
        continue
    }
    if ($ch -eq '@') {
        $j = $i
        while ($j -lt $n -and $text[$j] -ne '{') { $j++ }
        if ($j -ge $n) { break }
        $depth = 1
        $j++
        $start = $i
        while ($j -lt $n -and $depth -gt 0) {
            if ($text[$j] -eq '{') { $depth++ }
            elseif ($text[$j] -eq '}') { $depth-- }
            $j++
        }
        $block = $text.Substring($i, $j - $i)
        if ($block.TrimStart().StartsWith('@media')) {
            $innerStart = $block.IndexOf('{') + 1
            $inner = $block.Substring($innerStart, $block.Length - $innerStart - 1)
            foreach ($r in Get-RulesFromBlock $inner) {
                [void]$allRules.Add(@('media', $r[0], $r[1]))
            }
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
        [void]$allRules.Add(@('top', $sel, $decl))
    }
    $i = $j
}

$byBody = @{}
foreach ($r in $allRules) {
    $norm = Normalize-Decl $r[2]
    if (-not $norm) { continue }
    $propCount = ($norm -split '\|').Count
    if (-not $byBody.ContainsKey($norm)) {
        $byBody[$norm] = New-Object System.Collections.Generic.List[object]
    }
    [void]$byBody[$norm].Add(@($r[0], $r[1], $propCount))
}

$dupGroups = $byBody.GetEnumerator() | Where-Object { $_.Value.Count -ge 2 }

$totalSaved = 0
$topGroups = New-Object System.Collections.Generic.List[object]
foreach ($g in $dupGroups) {
    $items = $g.Value
    $nSel = $items.Count
    $propCount = $items[0][2]
    $sels = @()
    foreach ($it in $items) { $sels += $it[1] }
    $cur = 0
    foreach ($s in $sels) { $cur += (Rough-Lines $s $propCount) }
    $mergedSel = ($sels -join ', ')
    $merged = (Rough-Lines $mergedSel $propCount)
    $sav = $cur - $merged
    if ($sav -gt 0) {
        $totalSaved += $sav
        [void]$topGroups.Add([pscustomobject]@{ Save = $sav; Count = $nSel; Props = $propCount; Sample = ($mergedSel.Substring(0, [math]::Min(90, $mergedSel.Length))) })
    }
}

$top10 = $topGroups | Sort-Object Save -Descending | Select-Object -First 10

Write-Host "=== style.css duplicate-body analysis (PowerShell) ==="
Write-Host "Bytes (UTF-8):" ([System.Text.Encoding]::UTF8.GetByteCount($raw))
Write-Host "Rules parsed:" $allRules.Count
Write-Host "Unique non-empty declaration bodies:" $byBody.Count
Write-Host "Bodies with 2+ selectors:" ($dupGroups | Measure-Object).Count
Write-Host "Rough line savings (merge identical bodies only):" $totalSaved
Write-Host "`nTop 10 groups by estimated savings:"
$top10 | Format-Table -AutoSize

# Hex frequency
$hexMatches = [regex]::Matches($raw, '#(?:[0-9a-fA-F]{3}){1,2}\b')
$hexFreq = @{}
foreach ($m in $hexMatches) {
    $h = $m.Value.ToLowerInvariant()
    if (-not $hexFreq.ContainsKey($h)) { $hexFreq[$h] = 0 }
    $hexFreq[$h]++
}
Write-Host "Top 12 hex colors:"
$hexFreq.GetEnumerator() | Sort-Object Value -Descending | Select-Object -First 12 | Format-Table -AutoSize

Write-Host "!important count:" ([regex]::Matches($raw, '!important')).Count
