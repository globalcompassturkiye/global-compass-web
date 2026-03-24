# UTF-8: inline ana menü IIFE -> /js/nav-submenu.js
$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$marker = "var toggle = document.querySelector('.nav-toggle');"

function Find-InlineScriptStart([string]$content, [int]$markerPos) {
    $pos = $markerPos
    while ($pos -gt 0) {
        $i = $content.LastIndexOf('<script', $pos - 1)
        if ($i -lt 0) { return -1 }
        $end = $content.IndexOf('>', $i)
        if ($end -lt 0) { return -1 }
        $tag = $content.Substring($i, $end - $i + 1)
        if ($tag -match 'src=' -or $tag -match 'ld\+json' -or $tag -match 'application/ld') {
            $pos = $i
            continue
        }
        return $i
    }
    return -1
}

function Get-FirstIifeEnd([string]$content, [int]$scriptStart) {
    $slice = $content.Substring($scriptStart, [Math]::Min(800, $content.Length - $scriptStart))
    $m = [regex]::Match($slice, '\(function\s*\(\s*\)\s*\{')
    if (-not $m.Success) { return $null }
    $bodyStart = $scriptStart + $m.Index + $m.Length - 1
    $depth = 0
    $k = $bodyStart
    while ($k -lt $content.Length) {
        $c = $content[$k]
        if ($c -eq [char]'{') { $depth++ }
        elseif ($c -eq [char]'}') {
            $depth--
            if ($depth -eq 0) {
                $k++
                break
            }
        }
        $k++
    }
    if (($k + 4) -gt $content.Length) { return $null }
    if ($content.Substring($k, 4) -ne ')();') { return $null }
    return $k + 4
}

$count = 0
Get-ChildItem -Path $root -Recurse -Filter '*.html' | ForEach-Object {
    $path = $_.FullName
    if ($path -match 'node_modules') { return }
    $utf8 = New-Object System.Text.UTF8Encoding $false
    $content = [System.IO.File]::ReadAllText($path, $utf8)
    if ($content.IndexOf($marker) -lt 0) { return }

    $markerPos = $content.IndexOf($marker)
    $scriptStart = Find-InlineScriptStart $content $markerPos
    if ($scriptStart -lt 0) {
        Write-Host "skip (no script tag): $path"
        return
    }
    $iifeEnd = Get-FirstIifeEnd $content $scriptStart
    if ($null -eq $iifeEnd) {
        Write-Host "skip (brace parse): $path"
        return
    }
    $scriptClose = $content.IndexOf('</script>', $iifeEnd)
    if ($scriptClose -lt 0) {
        Write-Host "skip (no </script>): $path"
        return
    }
    $rest = $content.Substring($iifeEnd, $scriptClose - $iifeEnd)
    $restStripped = $rest.TrimStart("`r`n`t ")
    $inject = '<script src="/js/nav-submenu.js" defer></script>'
    if ($restStripped.Length -gt 0) {
        $inject += "`n    <script>`n" + $restStripped + "`n</script>"
    }
    $newContent = $content.Substring(0, $scriptStart) + $inject + $content.Substring($scriptClose + '</script>'.Length)
    [System.IO.File]::WriteAllText($path, $newContent, $utf8)
    Write-Host "ok: $path"
    $script:count++
}
Write-Host "updated $count files"
