# UTF-8: LCP-friendly critical <img> vs lazy/async for the rest; optional width/height from files.
# Critical: <header>, ancestors with hero/banner/main-slider/top-section (or *-hero), first <img> unless id=logo, loading=eager
# Critical attrs: no lazy, fetchpriority=high, decoding=sync
# Non-critical: loading=lazy, decoding=async, strip fetchpriority
$ErrorActionPreference = 'Stop'
$root = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path

$voidTags = [System.Collections.Generic.HashSet[string]]::new([StringComparer]::OrdinalIgnoreCase)
foreach ($t in @('area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr')) { [void]$voidTags.Add($t) }

$criticalClassExact = [System.Collections.Generic.HashSet[string]]::new([StringComparer]::OrdinalIgnoreCase)
foreach ($t in @('hero','banner','main-slider','top-section')) { [void]$criticalClassExact.Add($t) }

function Get-ScrubbedHtml([string]$html) {
    $scrub = $html
    $scrub = [regex]::Replace($scrub, '(?is)<script\b[^>]*>.*?</script>', {
        param($m)
        ''.PadLeft($m.Value.Length)
    })
    $scrub = [regex]::Replace($scrub, '(?is)<style\b[^>]*>.*?</style>', {
        param($m)
        ''.PadLeft($m.Value.Length)
    })
    return $scrub
}

function Get-ClassesFromAttrs([string]$attrPart) {
    $set = [System.Collections.Generic.HashSet[string]]::new([StringComparer]::OrdinalIgnoreCase)
    $m = [regex]::Match($attrPart, '(?i)\bclass\s*=\s*"([^"]*)"')
    if ($m.Success) {
        foreach ($tok in ($m.Groups[1].Value -split '\s+')) {
            if ($tok) { [void]$set.Add($tok) }
        }
        return $set
    }
    $m = [regex]::Match($attrPart, "(?i)\bclass\s*=\s*'([^']*)'")
    if ($m.Success) {
        foreach ($tok in ($m.Groups[1].Value -split '\s+')) {
            if ($tok) { [void]$set.Add($tok) }
        }
    }
    return $set
}

function Test-CriticalAncestorClasses([System.Collections.ArrayList]$stack) {
    foreach ($frame in $stack) {
        if (-not $frame.Classes) { continue }
        foreach ($tok in $frame.Classes) {
            if ($criticalClassExact.Contains($tok)) { return $true }
            if ($tok.EndsWith('-hero', [StringComparison]::OrdinalIgnoreCase)) { return $true }
            # Üst vitrin / kampüs blokları (LCP)
            if ($tok.Equals('okul-foto-alani', [StringComparison]::OrdinalIgnoreCase)) { return $true }
            if ($tok.Equals('okul-gorsel-alani', [StringComparison]::OrdinalIgnoreCase)) { return $true }
            if ($tok.Contains('foto-bolumu')) { return $true }
            if ($tok.Contains('kampus-kapsayici')) { return $true }
            if ($tok.EndsWith('-gorsel-kapsayici', [StringComparison]::OrdinalIgnoreCase)) { return $true }
        }
    }
    return $false
}

function Get-ParseStateAtImgIndex([string]$scrubbed, [int]$imgIndex) {
    $stack = [System.Collections.ArrayList]::new()
    $headerDepth = 0
    $pos = 0
    $len = [Math]::Min($scrubbed.Length, $imgIndex)
    $tagRx = [regex]'(?is)<(/?)([\w:-]+)((?:\s[^>]*)?)\s*(/?)>'
    while ($pos -lt $len) {
        $lt = $scrubbed.IndexOf('<', $pos)
        if ($lt -lt 0) { break }
        if ($lt -ge $imgIndex) { break }
        if ($lt + 4 -le $scrubbed.Length -and $scrubbed.Substring($lt, 4) -eq '<!--') {
            $ec = $scrubbed.IndexOf('-->', $lt + 4, [StringComparison]::Ordinal)
            $pos = if ($ec -ge 0) { $ec + 3 } else { $len }
            continue
        }
        $m = $tagRx.Match($scrubbed, $lt)
        if (-not $m.Success) { $pos = $lt + 1; continue }
        $full = $m.Value
        $isClose = $m.Groups[1].Value -eq '/'
        $name = $m.Groups[2].Value.ToLowerInvariant()
        $attrs = $m.Groups[3].Value
        $selfClose = ($m.Groups[4].Value -eq '/') -or $full.TrimEnd().EndsWith('/>')
        $tagEnd = $m.Index + $m.Length
        if ($tagEnd -gt $imgIndex) { break }
        if ($isClose) {
            for ($i = $stack.Count - 1; $i -ge 0; $i--) {
                $top = $stack[$i]
                if ($top.Name -eq $name) {
                    if ($top.Name -eq 'header' -and $headerDepth -gt 0) { $headerDepth-- }
                    $stack.RemoveAt($i)
                    break
                }
            }
            $pos = $tagEnd
            continue
        }
        if ($name -eq 'header') { $headerDepth++ }
        if ($voidTags.Contains($name) -or $selfClose) {
            $pos = $tagEnd
            continue
        }
        $cls = Get-ClassesFromAttrs $attrs
        [void]$stack.Add([pscustomobject]@{ Name = $name; Classes = $cls })
        $pos = $tagEnd
    }
    return [pscustomobject]@{ Stack = $stack; HeaderDepth = $headerDepth }
}

function Get-Attr([string]$tag, [string]$attrName) {
    $pat = '(?i)\b' + [regex]::Escape($attrName) + '\s*=\s*"([^"]*)"'
    $m = [regex]::Match($tag, $pat)
    if ($m.Success) { return $m.Groups[1].Value }
    $pat2 = "(?i)\b" + [regex]::Escape($attrName) + "\s*=\s*'([^']*)'"
    $m2 = [regex]::Match($tag, $pat2)
    if ($m2.Success) { return $m2.Groups[1].Value }
    return $null
}

function Test-TagCritical {
    param([string]$tag, [string]$html, [string]$scrubbed, [int]$idx, [int]$firstImgIdx)
    if ($tag -match '(?i)\bloading\s*=\s*["'']eager["'']') { return $true }
    $id = Get-Attr $tag 'id'
    if ($idx -eq $firstImgIdx -and $id -ne 'logo') { return $true }
    $st = Get-ParseStateAtImgIndex $scrubbed $idx
    if ($st.HeaderDepth -gt 0) { return $true }
    if (Test-CriticalAncestorClasses $st.Stack) { return $true }
    return $false
}

function Remove-ImgAttrs([string]$tag) {
    $t = $tag
    $t = [regex]::Replace($t, '(?i)\s+loading\s*=\s*("[^"]*"|''[^'']*'')', '')
    $t = [regex]::Replace($t, '(?i)\s+fetchpriority\s*=\s*("[^"]*"|''[^'']*'')', '')
    $t = [regex]::Replace($t, '(?i)\s+decoding\s*=\s*("[^"]*"|''[^'']*'')', '')
    $t = [regex]::Replace($t, '(?i)\s{2,}', ' ')
    return $t.Trim()
}

function Resolve-LocalImagePath([string]$src, [string]$htmlPath) {
    if ([string]::IsNullOrWhiteSpace($src)) { return $null }
    if ($src -match '^\s*https?://') { return $null }
    $s = $src.Trim()
    if ($s.StartsWith('/')) {
        $rel = $s.TrimStart('/').Replace('/', [IO.Path]::DirectorySeparatorChar)
        return [IO.Path]::GetFullPath([IO.Path]::Combine($root, $rel))
    }
    $dir = [IO.Path]::GetDirectoryName($htmlPath)
    return [IO.Path]::GetFullPath([IO.Path]::Combine($dir, $s.Replace('/', [IO.Path]::DirectorySeparatorChar)))
}

function Try-GetImageDimensions([string]$fullPath) {
    if (-not (Test-Path -LiteralPath $fullPath)) { return $null }
    try {
        Add-Type -AssemblyName System.Drawing -ErrorAction Stop
        $img = [System.Drawing.Image]::FromFile($fullPath)
        $w = $img.Width
        $h = $img.Height
        $img.Dispose()
        return @{ W = $w; H = $h }
    } catch {
        return $null
    }
}

function Get-AttrFromInner([string]$inner, [string]$attrName) {
    $fake = '<img ' + $inner + '>'
    return (Get-Attr $fake $attrName)
}

function Build-ImgTag {
    param([string]$baseTag, [bool]$critical, [string]$htmlPath)
    $t = Remove-ImgAttrs $baseTag
    if ($t -notmatch '(?i)^<img\b') { return $baseTag }
    $inner = $t.Substring(4).TrimStart()
    if ($inner.EndsWith('/>')) {
        $inner = $inner.Substring(0, $inner.Length - 2).TrimEnd()
        $close = ' />'
    } elseif ($inner.EndsWith('>')) {
        $inner = $inner.Substring(0, $inner.Length - 1).TrimEnd()
        $close = '>'
    } else {
        return $baseTag
    }
    $src = Get-AttrFromInner $inner 'src'
    if (-not (Get-AttrFromInner $inner 'width') -and -not (Get-AttrFromInner $inner 'height')) {
        $p = Resolve-LocalImagePath $src $htmlPath
        if ($p) {
            $dim = Try-GetImageDimensions $p
            if ($dim) {
                $inner = $inner.TrimEnd() + " width=`"$($dim.W)`" height=`"$($dim.H)`""
            }
        }
    }
    if ($critical) {
        $inner = $inner.TrimEnd() + ' fetchpriority="high" decoding="sync"'
    } else {
        $inner = $inner.TrimEnd() + ' loading="lazy" decoding="async"'
    }
    return '<img ' + $inner.TrimStart() + $close
}

$imgRx = New-Object System.Text.RegularExpressions.Regex '(?i)<img\b[^>]*>', ([System.Text.RegularExpressions.RegexOptions]::Compiled)
$fileCount = 0

Get-ChildItem -Path $root -Recurse -Filter '*.html' -File | Where-Object { $_.FullName -notmatch '\\node_modules\\' } | ForEach-Object {
    $path = $_.FullName
    $raw = [System.IO.File]::ReadAllText($path, [System.Text.UTF8Encoding]::new($false))
    $scrub = Get-ScrubbedHtml $raw
    $matches = $imgRx.Matches($raw)
    if ($matches.Count -eq 0) { return }

    $firstIdx = $matches[0].Index
    $replacements = @()
    foreach ($m in $matches) {
        $tag = $m.Value
        $idx = $m.Index
        $critical = Test-TagCritical -tag $tag -html $raw -scrubbed $scrub -idx $idx -firstImgIdx $firstIdx
        $newTag = Build-ImgTag -baseTag $tag -critical $critical -htmlPath $path
        if ($newTag -ne $tag) {
            $replacements += [pscustomobject]@{ Index = $idx; OldLen = $tag.Length; New = $newTag }
        }
    }
    if ($replacements.Count -eq 0) { return }

    $sb = New-Object System.Text.StringBuilder
    $cursor = 0
    foreach ($r in ($replacements | Sort-Object Index)) {
        [void]$sb.Append($raw.Substring($cursor, $r.Index - $cursor))
        [void]$sb.Append($r.New)
        $cursor = $r.Index + $r.OldLen
    }
    [void]$sb.Append($raw.Substring($cursor))
    $out = $sb.ToString()
    [System.IO.File]::WriteAllText($path, $out, [System.Text.UTF8Encoding]::new($false))
    $fileCount++
    Write-Output ($path.Substring($root.Length + 1))
}

Write-Host "Updated $fileCount files." -ForegroundColor Cyan
