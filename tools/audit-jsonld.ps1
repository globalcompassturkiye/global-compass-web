# JSON-LD audit: all HTML under repo root
$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$htmlFiles = Get-ChildItem -Path $root -Recurse -Filter '*.html' | Where-Object { $_.FullName -notmatch 'node_modules' }

function Get-LdJsonBlocks([string]$text) {
    $pattern = '<script\s+type=["'']application/ld\+json["'']\s*>([\s\S]*?)</script>'
    [regex]::Matches($text, $pattern, [System.Text.RegularExpressions.RegexOptions]::IgnoreCase) | ForEach-Object { $_.Groups[1].Value.Trim() }
}

function Get-TypesFromObject($obj) {
    $set = New-Object 'System.Collections.Generic.HashSet[string]'
    function Walk($n) {
        if ($null -eq $n) { return }
        if ($n -is [hashtable] -or ($n -is [pscustomobject])) {
            $t = $n.'@type'
            if ($null -ne $t) {
                if ($t -is [System.Array]) { foreach ($x in $t) { [void]$set.Add("$x") } }
                else { [void]$set.Add("$t") }
            }
            if ($null -ne $n.'@graph' -and $n.'@graph' -is [System.Array]) {
                foreach ($item in $n.'@graph') { Walk $item }
            }
            foreach ($p in $n.PSObject.Properties) {
                if ($p.Name -in '@type', '@graph', '@context') { continue }
                $v = $p.Value
                if ($v -is [hashtable] -or ($v -is [pscustomobject])) { Walk $v }
                elseif ($v -is [System.Array]) {
                    foreach ($x in $v) {
                        if ($x -is [hashtable] -or ($x -is [pscustomobject])) { Walk $x }
                    }
                }
            }
        }
    }
    Walk $obj
    return @($set | Sort-Object)
}

$missing = [System.Collections.ArrayList]@()
$incomplete = [System.Collections.ArrayList]@()
$ok = [System.Collections.ArrayList]@()
$multi = [System.Collections.ArrayList]@()

$categorySlugs = @(
    'lise','universite','yuksek-lisans-mba','yaz-okullari','vize-rehberi',
    'sehir-ulke-rehberi','online-egitim','kariyer-yolculugu','dil-okullari','burs-firsatlari'
)

foreach ($f in $htmlFiles) {
    $rel = $f.FullName.Substring($root.Length + 1).Replace('\', '/')
    $text = [System.IO.File]::ReadAllText($f.FullName, [System.Text.Encoding]::UTF8)
    $blocks = @(Get-LdJsonBlocks $text)
    if ($blocks.Count -eq 0) {
        [void]$missing.Add($rel)
        continue
    }
    if ($blocks.Count -gt 1) {
        [void]$multi.Add("$rel ($($blocks.Count) blok)")
    }
    $issues = New-Object System.Collections.ArrayList
    $allTypes = New-Object 'System.Collections.Generic.HashSet[string]'
    $bi = 0
    foreach ($raw in $blocks) {
        $bi++
        try {
            $data = $raw | ConvertFrom-Json
        } catch {
            [void]$issues.Add("Blok ${bi}: JSON parse - $($_.Exception.Message)")
            continue
        }
        if ($null -eq $data.'@context') {
            [void]$issues.Add("Blok ${bi}: @context yok")
        } else {
            $ctx = $data.'@context'
            $okCtx = ($ctx -eq 'https://schema.org' -or $ctx -eq 'http://schema.org')
            if (-not $okCtx -and $ctx -is [System.Array]) {
                foreach ($c in $ctx) {
                    if ($c -eq 'https://schema.org' -or $c -eq 'http://schema.org') { $okCtx = $true; break }
                }
            }
            if (-not $okCtx) {
                [void]$issues.Add("Blok ${bi}: @context schema.org degil")
            }
        }
        if ($null -eq $data.'@graph') {
            [void]$issues.Add("Blok ${bi}: @graph yok")
        } elseif (-not ($data.'@graph' -is [System.Array]) -or $data.'@graph'.Count -eq 0) {
            [void]$issues.Add("Blok ${bi}: @graph bos veya liste degil")
        }
        foreach ($t in (Get-TypesFromObject $data)) { [void]$allTypes.Add($t) }
    }
    foreach ($n in @('Organization', 'WebSite')) {
        if (-not $allTypes.Contains($n)) {
            [void]$issues.Add(('Eksik schema tipi: {0}' -f $n))
        }
    }
    # WebPage veya yaygin alt turleri (schema.org hiyerarsisi)
    $pageLike = @(
        'WebPage', 'CollectionPage', 'AboutPage', 'ContactPage', 'FAQPage',
        'ItemPage', 'ProfilePage', 'SearchResultsPage', 'CheckoutPage', 'RealEstateListing'
    )
    $hasPage = $false
    foreach ($pl in $pageLike) {
        if ($allTypes.Contains($pl)) { $hasPage = $true; break }
    }
    if (-not $hasPage) {
        [void]$issues.Add('Eksik: WebPage veya sayfa-alt-tipi (CollectionPage, AboutPage, ContactPage, ...)')
    }
    $parts = $rel -split '/'
    $isBlogPost = $false
    if ($parts[0] -eq 'blog' -and $rel -ne 'blog/index.html') {
        if ($parts.Length -eq 4 -and $parts[1] -in $categorySlugs -and $parts[3] -eq 'index.html' -and $parts[2] -ne 'index.html') {
            $isBlogPost = $true
        }
    }
    if ($isBlogPost -and -not $allTypes.Contains('Article')) {
        [void]$issues.Add('Blog yazisi: Article yok')
    }
    if ($issues.Count -gt 0) {
        [void]$incomplete.Add([pscustomobject]@{ Rel = $rel; Issues = $issues })
    } else {
        [void]$ok.Add($rel)
    }
}

Write-Output '=== JSON-LD denetim ozeti ==='
Write-Output "Toplam HTML: $($htmlFiles.Count)"
Write-Output "JSON-LD yok: $($missing.Count)"
Write-Output "Eksik/hatali: $($incomplete.Count)"
Write-Output "Tam: $($ok.Count)"
Write-Output ''
if ($missing.Count) {
    Write-Output '--- Script yok ---'
    $missing | ForEach-Object { Write-Output $_ }
    Write-Output ''
}
if ($incomplete.Count) {
    Write-Output '--- Sorunlu ---'
    foreach ($row in $incomplete) {
        Write-Output $row.Rel
        foreach ($i in $row.Issues) { Write-Output "  - $i" }
    }
    Write-Output ''
}
if ($multi.Count) {
    Write-Output '--- Coklu blok ---'
    $multi | ForEach-Object { Write-Output $_ }
}
