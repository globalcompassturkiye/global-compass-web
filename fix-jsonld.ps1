# Tum sayfalarda JSON-LD'yi sadece sayfa sonunda bırakır (tekrarlayan veya head'deki blokları kaldırıp son bloku </body> oncesine tasir).
$root = "c:\Users\cansu\Desktop\web-site\global-compass-web"
$pattern = '(?s)<script\s+type="application/ld\+json">\s*(.*?)\s*</script>'

Get-ChildItem -Path $root -Recurse -Filter "*.html" | ForEach-Object {
    $path = $_.FullName
    $content = Get-Content $path -Raw -Encoding UTF8
    if ($content -notmatch 'application/ld\+json') { return }

    $headEnd = $content.IndexOf('</head>')
    if ($headEnd -lt 0) { return }
    $bodyEnd = $content.LastIndexOf('</body>')
    if ($bodyEnd -lt 0) { return }

    $matches = [regex]::Matches($content, $pattern)
    if ($matches.Count -eq 0) { return }

    $blocks = @()
    foreach ($m in $matches) {
        $blocks += @{ Full = $m.Groups[0].Value; Index = $m.Index }
    }
    $jsonldToKeep = $blocks[-1].Full

    $newContent = $content
    foreach ($b in $blocks) {
        $newContent = $newContent.Replace($b.Full, '')
    }
    $newContent = $newContent.TrimEnd()
    if ($newContent.Contains('</body>')) {
        $insert = "`r`n`r`n    " + $jsonldToKeep.Replace("`r`n", "`r`n    ") + "`r`n"
        $newContent = $newContent.Replace('</body>', $insert + '</body>')
    }
    [System.IO.File]::WriteAllText($path, $newContent, [System.Text.UTF8Encoding]::new($false))
    Write-Host $path
}
