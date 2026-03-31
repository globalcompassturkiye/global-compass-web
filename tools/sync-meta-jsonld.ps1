# Sync og/twitter and JSON-LD (page Article/About/WebPage) with <title> and meta name=description
$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot

function Escape-HtmlAttr([string]$s) {
    if ($null -eq $s) { return '' }
    return $s.Replace('&', '&amp;').Replace('"', '&quot;')
}
function Escape-JsonStr([string]$s) {
    if ($null -eq $s) { return '' }
    return $s.Replace('\', '\\').Replace('"', '\"').Replace("`r`n", ' ').Replace("`n", ' ')
}

$files = Get-ChildItem -Path $root -Recurse -Filter '*.html' |
    Where-Object { $_.FullName -notmatch 'nav-main-fragment' }

$count = 0
foreach ($f in $files) {
    $raw = [System.IO.File]::ReadAllText($f.FullName, [System.Text.UTF8Encoding]::new($false))
    if ($raw -notmatch '(?i)<title>\s*([^<]+?)\s*</title>') { continue }
    $title = $matches[1].Trim()
    if ($raw -notmatch '(?i)<meta\s+name="description"\s+content="([^"]*)"') { continue }
    $desc = $matches[1]

    $titleA = Escape-HtmlAttr $title
    $descA = Escape-HtmlAttr $desc
    $titleJ = Escape-JsonStr $title
    $descJ = Escape-JsonStr $desc

    $new = $raw
    $changed = $false

    if ($new -match '(?i)<meta\s+property="og:title"') {
        $new = [regex]::Replace($new, '(?i)<meta\s+property="og:title"\s+content="[^"]*"', "<meta property=`"og:title`" content=`"$titleA`"")
        $changed = $true
    }
    if ($new -match '(?i)<meta\s+property="og:description"') {
        $new = [regex]::Replace($new, '(?i)<meta\s+property="og:description"\s+content="[^"]*"', "<meta property=`"og:description`" content=`"$descA`"")
        $changed = $true
    }
    if ($new -match '(?i)<meta\s+name="twitter:title"') {
        $new = [regex]::Replace($new, '(?i)<meta\s+name="twitter:title"\s+content="[^"]*"', "<meta name=`"twitter:title`" content=`"$titleA`"")
        $changed = $true
    }
    if ($new -match '(?i)<meta\s+name="twitter:description"') {
        $new = [regex]::Replace($new, '(?i)<meta\s+name="twitter:description"\s+content="[^"]*"', "<meta name=`"twitter:description`" content=`"$descA`"")
        $changed = $true
    }

    if ($new -match 'application/ld\+json') {
        # AboutPage (name + headline + description)
        $rxA = '(?ms)("@type"\s*:\s*"AboutPage",\s*"@id"\s*:\s*"[^"]+",\s*"url"\s*:\s*"[^"]+",\s*)"name"\s*:\s*"[^"]*",\s*"headline"\s*:\s*"[^"]*",\s*"description"\s*:\s*"[^"]*"'
        $new2 = [regex]::Replace($new, $rxA, {
                param($m)
                $m.Groups[1].Value + '"name": "' + $titleJ + '",' + "`r`n" +
                '          "headline": "' + $titleJ + '",' + "`r`n" +
                '          "description": "' + $descJ + '"'
            })
        if ($new2 -ne $new) { $new = $new2; $changed = $true }

        # WebPage / ContactPage / CollectionPage (#webpage)
        $rxW = '(?ms)("@type"\s*:\s*"(?:WebPage|ContactPage|CollectionPage)",\s*"@id"\s*:\s*"[^"]+#webpage",\s*"url"\s*:\s*"[^"]+",\s*)"name"\s*:\s*"[^"]*",\s*"description"\s*:\s*"[^"]*"'
        $new2 = [regex]::Replace($new, $rxW, {
                param($m)
                $m.Groups[1].Value + '"name": "' + $titleJ + '",' + "`r`n" +
                '          "description": "' + $descJ + '"'
            })
        if ($new2 -ne $new) { $new = $new2; $changed = $true }

        # Article (headline + description right after @id)
        $rxArt = '(?ms)("@type"\s*:\s*"Article",\s*"@id"\s*:\s*"[^"]+",\s*)"headline"\s*:\s*"[^"]*",\s*"description"\s*:\s*"[^"]*"'
        $new2 = [regex]::Replace($new, $rxArt, {
                param($m)
                $m.Groups[1].Value + '"headline": "' + $titleJ + '",' + "`r`n" +
                '          "description": "' + $descJ + '"'
            })
        if ($new2 -ne $new) { $new = $new2; $changed = $true }

        # Standalone WebPage block: name, description, url (e.g. sportech futbol)
        $rxAlt = '(?ms)("@type"\s*:\s*"WebPage",\s*)"name"\s*:\s*"[^"]*",\s*"description"\s*:\s*"[^"]*",\s*("url"\s*:\s*"[^"]*")'
        $new2 = [regex]::Replace($new, $rxAlt, {
                param($m)
                $m.Groups[1].Value + '"name": "' + $titleJ + '",' + "`r`n" +
                '        "description": "' + $descJ + '",' + "`r`n" +
                '        ' + $m.Groups[2].Value
            })
        if ($new2 -ne $new) { $new = $new2; $changed = $true }

        # ContactPage in iletisim (no #webpage in regex above - ContactPage has #webpage in @id)
        # Already covered by WebPage|ContactPage|CollectionPage

        # "name" ile aynı girintide "description" (yanlış 10 boşluk düzeltmesi)
        $fixRx = '(?m)^(\s+"name":\s*"[^"]+",)\r?\n\s{10}("description":\s*"[^"]*")'
        $new3 = [regex]::Replace($new, $fixRx, {
                param($m)
                $nl = $m.Groups[1].Value
                if ($nl -match '^(\s+)') {
                    $ind = $Matches[1]
                    return $nl + "`r`n" + $ind + $m.Groups[2].Value
                }
                return $m.Value
            })
        if ($new3 -ne $new) { $new = $new3; $changed = $true }
    }

    if ($changed -and $new -ne $raw) {
        [System.IO.File]::WriteAllText($f.FullName, $new, [System.Text.UTF8Encoding]::new($false))
        $count++
        Write-Host $f.FullName.Substring($root.Length + 1)
    }
}
Write-Host "--- Guncellenen dosya: $count"
