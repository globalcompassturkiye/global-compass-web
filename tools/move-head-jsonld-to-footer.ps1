$ErrorActionPreference = 'Stop'
$utf8 = [System.Text.UTF8Encoding]::new($false)
$root = Split-Path -Parent $PSScriptRoot

function Move-LdJsonToFooter([string]$relPath) {
    $full = Join-Path $root $relPath
    if (-not (Test-Path $full)) { Write-Warning "Missing: $full"; return }
    $t = [System.IO.File]::ReadAllText($full, $utf8)
    $headIdx = $t.IndexOf('<head>')
    $bodyIdx = $t.IndexOf('<body>')
    if ($headIdx -lt 0 -or $bodyIdx -lt 0) { Write-Warning "No head/body: $relPath"; return }
    $head = $t.Substring($headIdx, $bodyIdx - $headIdx)
    $m = [regex]::Match($head, '(?s)<script\s+type="application/ld\+json">.*?</script>')
    if (-not $m.Success) { Write-Warning "No ld+json in head: $relPath"; return }
    $blockStart = $headIdx + $m.Index
    $blockLen = $m.Length
    $block = $t.Substring($blockStart, $blockLen)
    $before = $t.Substring(0, $blockStart)
    $after = $t.Substring($blockStart + $blockLen)
    $t2 = $before + $after
    $footerClose = '</footer>'
    $fi = $t2.LastIndexOf($footerClose)
    if ($fi -lt 0) { Write-Warning "No footer: $relPath"; return }
    $insertAt = $fi + $footerClose.Length
    $insertion = "`r`n`r`n    " + $block.TrimStart()
    $t3 = $t2.Insert($insertAt, $insertion)
    [System.IO.File]::WriteAllText($full, $t3, $utf8)
    Write-Host "Moved: $relPath"
}

Move-LdJsonToFooter 'yurt-disi-yaz-okullari\germany\frankfurt\alpadia\index.html'
Move-LdJsonToFooter 'yurt-disi-yaz-okullari\switzerland\swiss-education-academy\index.html'
