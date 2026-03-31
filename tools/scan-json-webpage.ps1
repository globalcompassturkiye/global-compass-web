$root = Split-Path -Parent $PSScriptRoot
$all = Get-ChildItem -Path $root -Recurse -Filter '*.html' | Where-Object { $_.FullName -notmatch 'nav-main-fragment' }
$noJson = @()
$jsonNoWebpage = @()
$jsonHasWebpage = @()
foreach ($f in $all) {
    $t = [System.IO.File]::ReadAllText($f.FullName)
    if ($t -notmatch 'application/ld\+json') {
        $noJson += $f.FullName
        continue
    }
    if ($t -notmatch '#webpage') {
        $jsonNoWebpage += $f.FullName
    } else {
        $jsonHasWebpage += $f.FullName
    }
}
Write-Host "JSON-LD yok: $($noJson.Count)"
$noJson | ForEach-Object { Write-Host "  " $_.Substring($root.Length + 1) }
Write-Host ""
Write-Host "JSON-LD var ama dosyada #webpage yok: $($jsonNoWebpage.Count)"
$blogArticle = @()
$faqOnly = @()
$other = @()
foreach ($p in $jsonNoWebpage) {
    $t = [System.IO.File]::ReadAllText($p)
    $rel = $p.Substring($root.Length + 1)
    if ($t -match '#article') { $blogArticle += $rel; continue }
    if ($t -match '"@type"\s*:\s*"FAQPage"' -and $t -notmatch '"@type"\s*:\s*"WebPage"' -and $t -notmatch '"@type"\s*:\s*"ContactPage"' -and $t -notmatch '"@type"\s*:\s*"CollectionPage"' -and $t -notmatch '"@type"\s*:\s*"AboutPage"') {
        $faqOnly += $rel
        continue
    }
    $other += $rel
}
Write-Host ""
Write-Host "  (alt) Blog Article #article iceren: $($blogArticle.Count)"
$blogArticle | ForEach-Object { Write-Host "    $_" }
Write-Host ""
Write-Host "  (alt) Yalnizca FAQPage (WebPage/Contact/Collection yok): $($faqOnly.Count)"
$faqOnly | ForEach-Object { Write-Host "    $_" }
Write-Host ""
Write-Host "  (alt) Diger (WebPage var ama #webpage yok vb.): $($other.Count)"
$other | ForEach-Object { Write-Host "    $_" }
