#Requires -Version 5.1
# Senaryo A: Aynı bildirim gövdesine sahip seçicileri birleştirir (top / @media / @supports ayrı kapsamlar).
# Yorumlar kaldırılır. Yedek: css/style.css.pre-scenario-a

param(
    [string]$Source = (Join-Path $PSScriptRoot '..\css\style.css'),
    [string]$Backup = (Join-Path $PSScriptRoot '..\css\style.css.pre-scenario-a')
)

$ErrorActionPreference = 'Stop'

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

function Format-DeclBlock([string]$decl) {
    $normLines = New-Object System.Collections.Generic.List[string]
    foreach ($part in $decl -split ';') {
        $line = $part.Trim()
        if (-not $line -or $line.IndexOf(':') -lt 0) { continue }
        if ($line -notmatch ';\s*$') { $line = $line + ';' }
        [void]$normLines.Add("    $line")
    }
    ($normLines -join "`n")
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
    # Tek çıktı olarak dön (içteki 2 elemanlı dizi return ile açılıp hata üretmesin)
    return ,$list
}

function Build-MergePlan($rulesWithIndex) {
    $groups = @{}
    foreach ($item in $rulesWithIndex) {
        $norm = Normalize-Decl $item.Decl
        if (-not $norm) { continue }
        if (-not $groups.ContainsKey($norm)) {
            $groups[$norm] = New-Object System.Collections.Generic.List[object]
        }
        [void]$groups[$norm].Add($item)
    }
    $leader = @{}
    $skip = @{}
    foreach ($norm in $groups.Keys) {
        $items = $groups[$norm]
        if ($items.Count -lt 2) { continue }
        $minIdx = ($items | ForEach-Object { $_.Idx } | Measure-Object -Minimum).Minimum
        $sels = $items | ForEach-Object { $_.Sel } | Sort-Object -Unique
        $sampleDecl = ($items | Where-Object { $_.Idx -eq $minIdx } | Select-Object -First 1).Decl
        if (-not $sampleDecl) { $sampleDecl = $items[0].Decl }
        $leader[$minIdx] = @{ Sels = $sels; Decl = $sampleDecl }
        foreach ($it in $items) {
            if ($it.Idx -ne $minIdx) { $skip[$it.Idx] = $true }
        }
    }
    [pscustomobject]@{ Leader = $leader; Skip = $skip }
}

function Emit-MergedRules($rulesWithIndex, $plan) {
    $sb = New-Object System.Text.StringBuilder
    foreach ($item in ($rulesWithIndex | Sort-Object Idx)) {
        if ($plan.Skip.ContainsKey($item.Idx)) { continue }
        if ($plan.Leader.ContainsKey($item.Idx)) {
            $L = $plan.Leader[$item.Idx]
            $mergedSel = ($L.Sels -join ', ')
            [void]$sb.AppendLine("$mergedSel {")
            [void]$sb.AppendLine((Format-DeclBlock $L.Decl))
            [void]$sb.AppendLine('}')
            [void]$sb.AppendLine('')
        }
        else {
            [void]$sb.AppendLine("$($item.Sel) {")
            [void]$sb.AppendLine((Format-DeclBlock $item.Decl))
            [void]$sb.AppendLine('}')
            [void]$sb.AppendLine('')
        }
    }
    return $sb.ToString()
}

# --- Tek geçiş: sıralı akış ---
$raw = [System.IO.File]::ReadAllText($Source, [System.Text.Encoding]::UTF8)
Copy-Item -LiteralPath $Source -Destination $Backup -Force

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
        $start = $i
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
            $rw = New-Object System.Collections.Generic.List[object]
            $localIdx = 0
            foreach ($r in $rules) {
                [void]$rw.Add([pscustomobject]@{ Sel = $r.Sel; Decl = $r.Decl; Idx = $localIdx })
                $localIdx++
            }
            [void]$stream.Add([pscustomobject]@{ Kind = 'atmerge'; Header = $hdr; Rules = $rw })
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

$topRules = $stream | Where-Object { $_.Kind -eq 'top' }
$topPlan = Build-MergePlan $topRules

$sbFinal = New-Object System.Text.StringBuilder
[void]$sbFinal.AppendLine('@import url("site-cls-rezerv.css");')
[void]$sbFinal.AppendLine('')
[void]$sbFinal.AppendLine('/* style.css: Scenario A merged duplicate declaration blocks. Backup: style.css.pre-scenario-a */')
[void]$sbFinal.AppendLine('')

foreach ($seg in $stream) {
    if ($seg.Kind -eq 'top') {
        if ($topPlan.Skip.ContainsKey($seg.Idx)) { continue }
        if ($topPlan.Leader.ContainsKey($seg.Idx)) {
            $L = $topPlan.Leader[$seg.Idx]
            $mergedSel = ($L.Sels -join ', ')
            [void]$sbFinal.AppendLine("$mergedSel {")
            [void]$sbFinal.AppendLine((Format-DeclBlock $L.Decl))
            [void]$sbFinal.AppendLine('}')
            [void]$sbFinal.AppendLine('')
        }
        else {
            [void]$sbFinal.AppendLine("$($seg.Sel) {")
            [void]$sbFinal.AppendLine((Format-DeclBlock $seg.Decl))
            [void]$sbFinal.AppendLine('}')
            [void]$sbFinal.AppendLine('')
        }
    }
    elseif ($seg.Kind -eq 'atmerge') {
        $plan = Build-MergePlan $seg.Rules
        $body = Emit-MergedRules $seg.Rules $plan
        [void]$sbFinal.AppendLine("$($seg.Header) {")
        [void]$sbFinal.Append($body)
        [void]$sbFinal.AppendLine('}')
        [void]$sbFinal.AppendLine('')
    }
    elseif ($seg.Kind -eq 'opaque') {
        [void]$sbFinal.AppendLine($seg.Raw)
        [void]$sbFinal.AppendLine('')
    }
}

$utf8NoBom = New-Object System.Text.UTF8Encoding $false
[System.IO.File]::WriteAllText($Source, $sbFinal.ToString(), $utf8NoBom)

$oldLines = ($raw -split "`n").Count
$newLines = ($sbFinal.ToString() -split "`n").Count
$oldBytes = [System.Text.Encoding]::UTF8.GetByteCount($raw)
$newBytes = [System.Text.Encoding]::UTF8.GetByteCount($sbFinal.ToString())
Write-Host "OK: $Source"
Write-Host "Yedek: $Backup"
Write-Host "Satir: $oldLines -> $newLines (delta: $($newLines - $oldLines))"
Write-Host "Bayt:  $oldBytes -> $newBytes (delta: $($newBytes - $oldBytes))"
