# UTF-8: Bu betikteki Türkçe sabitlerin bozulmaması için dosyayı UTF-8 BOM ile kaydedin
# veya Organization bloğunu harici UTF-8 JSON parçasından okuyun.
$ErrorActionPreference = 'Stop'
$utf8 = [System.Text.UTF8Encoding]::new($false)
$root = Split-Path -Parent $PSScriptRoot

function Get-MainEntityArray([string]$html) {
    $idx = $html.IndexOf('"mainEntity"')
    if ($idx -lt 0) { return $null }
    $rest = $html.Substring($idx)
    $start = $rest.IndexOf('[')
    if ($start -lt 0) { return $null }
    $i = $start
    $depth = 0
    $end = -1
    while ($i -lt $rest.Length) {
        $c = $rest[$i]
        if ($c -eq '[') { $depth++ }
        elseif ($c -eq ']') {
            $depth--
            if ($depth -eq 0) { $end = $i; break }
        }
        $i++
    }
    if ($end -lt 0) { return $null }
    return $rest.Substring($start, $end - $start + 1)
}

function Escape-Json([string]$s) {
    if ($null -eq $s) { return '' }
    return $s.Replace('\', '\\').Replace('"', '\"')
}

$targets = @(
    @{ Rel = 'yurt-disi-yaz-okullari\canada\toronto\index.html'; Bc = @(
        @('Ana Sayfa', 'https://www.globalcompass.com.tr/'),
        @('Yurt Dışı Yaz Okulları', 'https://www.globalcompass.com.tr/yurt-disi-yaz-okullari/'),
        @('Kanada Yaz Okulları', 'https://www.globalcompass.com.tr/yurt-disi-yaz-okullari/canada/'),
        @('Toronto Yaz Okulları', 'https://www.globalcompass.com.tr/yurt-disi-yaz-okullari/canada/toronto/')
    )}
    @{ Rel = 'yurt-disi-yaz-okullari\germany\index.html'; Bc = @(
        @('Ana Sayfa', 'https://www.globalcompass.com.tr/'),
        @('Yurt Dışı Yaz Okulları', 'https://www.globalcompass.com.tr/yurt-disi-yaz-okullari/'),
        @('Almanya Yaz Okulları', 'https://www.globalcompass.com.tr/yurt-disi-yaz-okullari/germany/')
    )}
    @{ Rel = 'yurt-disi-yaz-okullari\germany\frankfurt\index.html'; Bc = @(
        @('Ana Sayfa', 'https://www.globalcompass.com.tr/'),
        @('Yurt Dışı Yaz Okulları', 'https://www.globalcompass.com.tr/yurt-disi-yaz-okullari/'),
        @('Almanya Yaz Okulları', 'https://www.globalcompass.com.tr/yurt-disi-yaz-okullari/germany/'),
        @('Frankfurt Yaz Okulları', 'https://www.globalcompass.com.tr/yurt-disi-yaz-okullari/germany/frankfurt/')
    )}
    @{ Rel = 'yurt-disi-yaz-okullari\germany\freiburg\index.html'; Bc = @(
        @('Ana Sayfa', 'https://www.globalcompass.com.tr/'),
        @('Yurt Dışı Yaz Okulları', 'https://www.globalcompass.com.tr/yurt-disi-yaz-okullari/'),
        @('Almanya Yaz Okulları', 'https://www.globalcompass.com.tr/yurt-disi-yaz-okullari/germany/'),
        @('Freiburg Yaz Okulları', 'https://www.globalcompass.com.tr/yurt-disi-yaz-okullari/germany/freiburg/')
    )}
    @{ Rel = 'yurt-disi-yaz-okullari\italy\index.html'; Bc = @(
        @('Ana Sayfa', 'https://www.globalcompass.com.tr/'),
        @('Yurt Dışı Yaz Okulları', 'https://www.globalcompass.com.tr/yurt-disi-yaz-okullari/'),
        @('İtalya Yaz Okulları', 'https://www.globalcompass.com.tr/yurt-disi-yaz-okullari/italy/')
    )}
    @{ Rel = 'yurt-disi-yaz-okullari\italy\milan\index.html'; Bc = @(
        @('Ana Sayfa', 'https://www.globalcompass.com.tr/'),
        @('Yurt Dışı Yaz Okulları', 'https://www.globalcompass.com.tr/yurt-disi-yaz-okullari/'),
        @('İtalya Yaz Okulları', 'https://www.globalcompass.com.tr/yurt-disi-yaz-okullari/italy/'),
        @('Milano Yaz Okulları', 'https://www.globalcompass.com.tr/yurt-disi-yaz-okullari/italy/milan/')
    )}
    @{ Rel = 'yurt-disi-yaz-okullari\switzerland\index.html'; Bc = @(
        @('Ana Sayfa', 'https://www.globalcompass.com.tr/'),
        @('Yurt Dışı Yaz Okulları', 'https://www.globalcompass.com.tr/yurt-disi-yaz-okullari/'),
        @('İsviçre Yaz Okulları', 'https://www.globalcompass.com.tr/yurt-disi-yaz-okullari/switzerland/')
    )}
    @{ Rel = 'yurt-disi-yaz-okullari\canada\toronto\immerse-education\index.html'; Bc = @(
        @('Ana Sayfa', 'https://www.globalcompass.com.tr/'),
        @('Yurt Dışı Yaz Okulları', 'https://www.globalcompass.com.tr/yurt-disi-yaz-okullari/'),
        @('Kanada Yaz Okulları', 'https://www.globalcompass.com.tr/yurt-disi-yaz-okullari/canada/'),
        @('Toronto Yaz Okulları', 'https://www.globalcompass.com.tr/yurt-disi-yaz-okullari/canada/toronto/'),
        @('Immerse Education Toronto', 'https://www.globalcompass.com.tr/yurt-disi-yaz-okullari/canada/toronto/immerse-education/')
    )}
    @{ Rel = 'yurt-disi-yaz-okullari\germany\frankfurt\alpadia\index.html'; Bc = @(
        @('Ana Sayfa', 'https://www.globalcompass.com.tr/'),
        @('Yurt Dışı Yaz Okulları', 'https://www.globalcompass.com.tr/yurt-disi-yaz-okullari/'),
        @('Almanya Yaz Okulları', 'https://www.globalcompass.com.tr/yurt-disi-yaz-okullari/germany/'),
        @('Frankfurt Yaz Okulları', 'https://www.globalcompass.com.tr/yurt-disi-yaz-okullari/germany/frankfurt/'),
        @('Alpadia Frankfurt Lahntal', 'https://www.globalcompass.com.tr/yurt-disi-yaz-okullari/germany/frankfurt/alpadia/')
    )}
    @{ Rel = 'yurt-disi-yaz-okullari\germany\freiburg\alpadia\index.html'; Bc = @(
        @('Ana Sayfa', 'https://www.globalcompass.com.tr/'),
        @('Yurt Dışı Yaz Okulları', 'https://www.globalcompass.com.tr/yurt-disi-yaz-okullari/'),
        @('Almanya Yaz Okulları', 'https://www.globalcompass.com.tr/yurt-disi-yaz-okullari/germany/'),
        @('Freiburg Yaz Okulları', 'https://www.globalcompass.com.tr/yurt-disi-yaz-okullari/germany/freiburg/'),
        @('Alpadia Freiburg', 'https://www.globalcompass.com.tr/yurt-disi-yaz-okullari/germany/freiburg/alpadia/')
    )}
    @{ Rel = 'yurt-disi-yaz-okullari\switzerland\swiss-education-academy\index.html'; Bc = @(
        @('Ana Sayfa', 'https://www.globalcompass.com.tr/'),
        @('Yurt Dışı Yaz Okulları', 'https://www.globalcompass.com.tr/yurt-disi-yaz-okullari/'),
        @('İsviçre Yaz Okulları', 'https://www.globalcompass.com.tr/yurt-disi-yaz-okullari/switzerland/'),
        @('Swiss Education Academy', 'https://www.globalcompass.com.tr/yurt-disi-yaz-okullari/switzerland/swiss-education-academy/')
    )}
)

foreach ($t in $targets) {
    $full = Join-Path $root $t.Rel
    if (-not (Test-Path $full)) { Write-Warning "Yok: $full"; continue }
    $html = [System.IO.File]::ReadAllText($full, $utf8)
    if ($html -match '"@graph"') { Write-Host "Atlandi: $($t.Rel)"; continue }
    if ($html -notmatch '<title>([^<]+)</title>') { Write-Warning "title: $($t.Rel)"; continue }
    $title = $matches[1].Trim()
    if ($html -notmatch '<meta\s+name="description"\s+content="([^"]*)"') { Write-Warning "desc: $($t.Rel)"; continue }
    $desc = $matches[1]
    if ($html -notmatch 'rel="canonical"\s+href="([^"]+)"') { Write-Warning "canonical: $($t.Rel)"; continue }
    $canon = $matches[1].Trim()
    if (-not $canon.EndsWith('/')) { $canon = $canon + '/' }
    $me = Get-MainEntityArray $html
    if (-not $me) { Write-Warning "mainEntity: $($t.Rel)"; continue }

    $titleJ = Escape-Json $title
    $descJ = Escape-Json $desc
    $webId = $canon + '#webpage'
    $faqId = $canon + '#faq'
    $bcId = $canon + '#breadcrumb'

    $bcLines = [System.Collections.ArrayList]::new()
    $pos = 1
    foreach ($row in $t.Bc) {
        $nm = Escape-Json $row[0]
        $u = $row[1]
        [void]$bcLines.Add("            { `"@type`": `"ListItem`", `"position`": $pos, `"name`": `"$nm`", `"item`": `"$u`" }")
        $pos++
    }
    $bcJson = $bcLines -join ",`n"

    $out = @"
    {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "Organization",
          "@id": "https://www.globalcompass.com.tr/#organization",
          "name": "Global Compass Danışmanlık Limited Şirketi",
          "alternateName": "Global Compass",
          "description": "Yurt dışı eğitim danışmanlığı. Dil okulu, lise, üniversite, yüksek lisans, yaz okulu ve burs danışmanlığı.",
          "url": "https://www.globalcompass.com.tr/",
          "logo": {
            "@type": "ImageObject",
            "url": "https://www.globalcompass.com.tr/img/global-compass-logo.webp"
          },
          "email": "info@globalcompass.com.tr",
          "telephone": "+90-535-397-73-99",
          "address": {
            "@type": "PostalAddress",
            "streetAddress": "Kızılay mah. Elgün sok. Tuğaç İşhanı 3.Kat No:11 İç Kapı No:52",
            "addressLocality": "Çankaya",
            "addressRegion": "Ankara",
            "addressCountry": "TR"
          },
          "contactPoint": {
            "@type": "ContactPoint",
            "telephone": "+90-535-397-73-99",
            "contactType": "customer service",
            "areaServed": "TR",
            "availableLanguage": ["tr"]
          }
        },
        {
          "@type": "WebSite",
          "@id": "https://www.globalcompass.com.tr/#website",
          "url": "https://www.globalcompass.com.tr/",
          "name": "Global Compass",
          "publisher": { "@id": "https://www.globalcompass.com.tr/#organization" },
          "inLanguage": "tr-TR"
        },
        {
          "@type": "WebPage",
          "@id": "$webId",
          "url": "$canon",
          "name": "$titleJ",
          "description": "$descJ",
          "isPartOf": { "@id": "https://www.globalcompass.com.tr/#website" },
          "publisher": { "@id": "https://www.globalcompass.com.tr/#organization" },
          "inLanguage": "tr-TR"
        },
        {
          "@type": "FAQPage",
          "@id": "$faqId",
          "url": "$canon",
          "isPartOf": { "@id": "https://www.globalcompass.com.tr/#website" },
          "publisher": { "@id": "https://www.globalcompass.com.tr/#organization" },
          "mainEntity": $me
        },
        {
          "@type": "BreadcrumbList",
          "@id": "$bcId",
          "itemListElement": [
$bcJson
          ]
        }
      ]
    }
"@

    $newHtml = [regex]::Replace($html, '(?s)<script\s+type="application/ld\+json">.*?</script>', "<script type=`"application/ld+json`">`n$out`n    </script>", 1)
    if ($newHtml -eq $html) { Write-Warning "regex: $($t.Rel)"; continue }
    [System.IO.File]::WriteAllText($full, $newHtml, $utf8)
    Write-Host "OK: $($t.Rel)"
}
