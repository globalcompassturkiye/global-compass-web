# UTF-8: Eski betik — tam LCP/fetchpriority kuralları için smart-img-optimize.ps1 kullanın.
# Bu dosya geriye dönük referans için bırakılmıştır.
$ErrorActionPreference = 'Stop'
$root = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path

function Test-InHeader([string]$html, [int]$idx) {
    $h0 = $html.LastIndexOf('<header', $idx, [StringComparison]::OrdinalIgnoreCase)
    if ($h0 -lt 0) { return $false }
    $h1 = $html.IndexOf('</header>', $h0, [StringComparison]::OrdinalIgnoreCase)
    if ($h1 -lt 0) { return $false }
    return $idx -lt $h1
}

function Get-SrcFromTag([string]$tag) {
    $m = [regex]::Match($tag, 'src\s*=\s*"([^"]*)"', [System.Text.RegularExpressions.RegexOptions]::IgnoreCase)
    if ($m.Success) { return $m.Groups[1].Value }
    $m = [regex]::Match($tag, "src\s*=\s*'([^']*)'", [System.Text.RegularExpressions.RegexOptions]::IgnoreCase)
    if ($m.Success) { return $m.Groups[1].Value }
    return ''
}

function Get-ClassFromTag([string]$tag) {
    $m = [regex]::Match($tag, 'class\s*=\s*"([^"]*)"', [System.Text.RegularExpressions.RegexOptions]::IgnoreCase)
    if ($m.Success) { return $m.Groups[1].Value }
    $m = [regex]::Match($tag, "class\s*=\s*'([^']*)'", [System.Text.RegularExpressions.RegexOptions]::IgnoreCase)
    if ($m.Success) { return $m.Groups[1].Value }
    return ''
}

function Test-SkipLazy([string]$tag, [string]$html, [int]$idx) {
    if ($tag -match '(?i)\bloading\s*=') { return $true }
    $src = (Get-SrcFromTag $tag).ToLowerInvariant()
    $classes = (Get-ClassFromTag $tag).ToLowerInvariant()
    foreach ($s in @('home-icon', '/sosyal/', 'global-compass-favicon')) {
        if ($src.Contains($s.ToLowerInvariant())) { return $true }
    }
    if ($src.Contains('/img/logo/')) { return $true }
    if ($src.Contains('kings-education-photo') -and -not $src.Contains('accreditation')) { return $true }
    foreach ($s in @('footer-logo-img', 'odeme-ust-logo-img')) {
        if ($classes.Contains($s)) { return $true }
    }
    $heroSubs = @('-foto', 'kings-education-gorsel', 'chantemerle-gorsel', 'immerse-kampus-gorsel', 'alpadia-kampus-gorsel',
        'investin-logo', 'immerse-logo', 'sportech-academy-logo', 'alpadia-logo', 'futbol-logo')
    foreach ($s in $heroSubs) {
        if ($classes.Contains($s.ToLowerInvariant())) {
            if ($classes.Contains('akreditasyon')) { return $false }
            return $true
        }
    }
    if (Test-InHeader $html $idx) { return $true }
    return $false
}

function Update-ImgTag([string]$tag, [string]$html, [int]$idx) {
    $needDec = $tag -notmatch '(?i)\bdecoding\s*='
    $needLazy = ($tag -notmatch '(?i)\bloading\s*=') -and -not (Test-SkipLazy $tag $html $idx)
    if (-not $needDec -and -not $needLazy) { return $tag }
    $frag = ''
    if ($needLazy) { $frag += ' loading="lazy"' }
    if ($needDec) { $frag += ' decoding="async"' }
    if ($tag -match '(\s*)/>$') {
        $core = $tag.Substring(0, $tag.Length - $Matches[0].Length).TrimEnd()
        return $core + $frag + ' />'
    }
    if ($tag -match '>$') {
        $core = $tag.Substring(0, $tag.Length - 1).TrimEnd()
        return $core + $frag + '>'
    }
    return $tag
}

$rx = New-Object System.Text.RegularExpressions.Regex '<img\b[^>]*>', ([System.Text.RegularExpressions.RegexOptions]::IgnoreCase)
$count = 0
Get-ChildItem -Path $root -Recurse -Filter '*.html' -File | Where-Object { $_.FullName -notmatch '\\node_modules\\' } | ForEach-Object {
    $path = $_.FullName
    $raw = [System.IO.File]::ReadAllText($path, [System.Text.Encoding]::UTF8)
    $ms = $rx.Matches($raw)
    if ($ms.Count -eq 0) { return }
    $sb = New-Object System.Text.StringBuilder
    $last = 0
    $changed = $false
    foreach ($m in $ms) {
        [void]$sb.Append($raw.Substring($last, $m.Index - $last))
        $newTag = Update-ImgTag $m.Value $raw $m.Index
        if ($newTag -ne $m.Value) { $changed = $true }
        [void]$sb.Append($newTag)
        $last = $m.Index + $m.Length
    }
    [void]$sb.Append($raw.Substring($last))
    $newRaw = $sb.ToString()
    if ($changed) {
        $utf8NoBom = New-Object System.Text.UTF8Encoding $false
        [System.IO.File]::WriteAllText($path, $newRaw, $utf8NoBom)
        $count++
        Write-Output ($path.Substring($root.Length + 1))
    }
}
Write-Host "Updated $count files." -ForegroundColor Cyan
