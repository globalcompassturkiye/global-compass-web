#Requires -Version 5.1
# kutu-baslik sss-baslik + vurgu-satir -> kutu-baslik + br + span.vurgu-renk
$root = Join-Path $PSScriptRoot '..'
$utf8 = New-Object System.Text.UTF8Encoding $false
$files = Get-ChildItem -Path $root -Filter '*.html' -Recurse -File | Where-Object {
    $_.FullName -notmatch '\\node_modules\\' -and $_.FullName -notmatch '\\tools\\'
}
$n = 0
foreach ($f in $files) {
    $c = [System.IO.File]::ReadAllText($f.FullName, $utf8)
    $orig = $c

    # 1) Cok satirli: h2 acilis ... span.vurgu-satir ... /h2
    $c = [regex]::Replace($c,
        '(?s)<h2 class="kutu-baslik sss-baslik"([^>]*)>([\s\S]*?)<span class="vurgu-satir">([^<]+)</span>\s*</h2>',
        {
            param($m)
            $attr = $m.Groups[1].Value
            $line1 = $m.Groups[2].Value -replace '^\s+|\s+$', '' -replace '\s+', ' '
            $line2 = $m.Groups[3].Value.Trim()
            if (-not $line1) { return $m.Value }
            return "<h2 class=`"kutu-baslik`"$attr>$line1<br>`n                <span class=`"vurgu-renk`">$line2</span></h2>"
        })

    # 2) Tek satir: metin + span.vurgu-satir (cok satir regexi tutmadiysa)
    $c = [regex]::Replace($c,
        '<h2 class="kutu-baslik sss-baslik"([^>]*)>([^<]+)<span class="vurgu-satir">([^<]+)</span></h2>',
        '<h2 class="kutu-baslik"$1>$2<br>
                <span class="vurgu-renk">$3</span></h2>')

    # 3) Kalan: sadece kutu-baslik sss-baslik (ikinci satir yok)
    $c = [regex]::Replace($c,
        '<h2 class="kutu-baslik sss-baslik"([^>]*)>([^<]+)</h2>',
        '<h2 class="kutu-baslik"$1>$2</h2>')

    # 4) Canford: Program + vurgu-renk tek satir -> iki satir
    $c = $c.Replace(
        '<h2 class="kutu-baslik">Program <span class="vurgu-renk">Detayları</span></h2>',
        "<h2 class=`"kutu-baslik`">Program<br>`n                <span class=`"vurgu-renk`">Detayları</span></h2>")

    # 5) /sss/ hub: gri-cerceve-baslik sss-baslik tek satir -> kutu-baslik (diger SSS kutulariyla uyum)
    $c = [regex]::Replace($c,
        '<h2 class="gri-cerceve-baslik sss-baslik"([^>]*)>([^<]+)</h2>',
        '<h2 class="kutu-baslik"$1>$2</h2>')

    if ($c -ne $orig) {
        [System.IO.File]::WriteAllText($f.FullName, $c, $utf8)
        $n++
        Write-Host $f.FullName
    }
}
Write-Host "Guncellenen dosya: $n"
