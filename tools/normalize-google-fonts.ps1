# UTF-8: Google Fonts href'lerine display=swap; fonts.gstatic.com preconnect eksikse ekle.
$ErrorActionPreference = 'Stop'
$root = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$utf8 = [System.Text.UTF8Encoding]::new($false)
$gstaticLine = '    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>'

function Add-DisplaySwapToGoogleFontUrls([string]$html) {
    $rx = [regex]'(href=")(https://fonts\.googleapis\.com[^"]+)(")'
    return $rx.Replace($html, {
            param($m)
            $u = $m.Groups[2].Value
            if ($u -match '(?i)[?&]display=') {
                return $m.Value
            }
            $sep = if ($u.Contains('?')) { '&' } else { '?' }
            return $m.Groups[1].Value + $u + $sep + 'display=swap' + $m.Groups[3].Value
        })
}

function Ensure-GstaticPreconnect([string]$html) {
    if ($html -notmatch 'fonts\.googleapis\.com/css2\?') {
        return $html
    }
    if ($html -match 'fonts\.gstatic\.com') {
        return $html
    }
    $m = [regex]::Match($html, '<link\s+rel="preconnect"\s+href="https://fonts\.googleapis\.com"[^>]*>')
    if ($m.Success) {
        $insertAt = $m.Index + $m.Length
        return $html.Insert($insertAt, [Environment]::NewLine + $gstaticLine)
    }
    $m2 = [regex]::Match($html, '<link\s+href="https://fonts\.googleapis\.com')
    if ($m2.Success) {
        $prefix = '    <link rel="preconnect" href="https://fonts.googleapis.com">' + [Environment]::NewLine +
            $gstaticLine + [Environment]::NewLine + '    '
        return $html.Insert($m2.Index, $prefix)
    }
    return $html
}

$n = 0
Get-ChildItem -Path $root -Recurse -Filter '*.html' -File | Where-Object { $_.FullName -notmatch '\\node_modules\\' } | ForEach-Object {
    $p = $_.FullName
    $raw = [System.IO.File]::ReadAllText($p, $utf8)
    if ($raw -notmatch 'fonts\.googleapis\.com') { return }
    $new = Add-DisplaySwapToGoogleFontUrls $raw
    $new = Ensure-GstaticPreconnect $new
    if ($new -ne $raw) {
        [System.IO.File]::WriteAllText($p, $new, $utf8)
        $n++
        Write-Output ($p.Substring($root.Length + 1))
    }
}
Write-Host "Updated $n files." -ForegroundColor Cyan
