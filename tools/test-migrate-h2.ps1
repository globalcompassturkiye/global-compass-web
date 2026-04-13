$ErrorActionPreference = 'Stop'
function Migrate-H2KutuInHtml([string]$html) {
    $rxClose = New-Object System.Text.RegularExpressions.Regex('^(?i)</(div|section)\b[^>]*>', 'Compiled')
    $rxOpenBlock = New-Object System.Text.RegularExpressions.Regex('^(?i)<(div|section)(\s[^>]*)?>', 'Compiled')
    $rxH2Open = New-Object System.Text.RegularExpressions.Regex('^(?i)<h2(\s[^>]*)>', 'Compiled')
    $rxAnyTag = New-Object System.Text.RegularExpressions.Regex('^<[^>]+>', 'Compiled')

    $list = New-Object System.Collections.ArrayList
    $sb = New-Object System.Text.StringBuilder
    $pos = 0
    $len = $html.Length

    while ($pos -lt $len) {
        $ch = $html[$pos]
        if ($ch -ne '<') {
            [void]$sb.Append($ch)
            $pos++
            continue
        }

        $rest = $html.Substring($pos)

        if ($rest.StartsWith('<!--')) {
            $end = $html.IndexOf('-->', $pos, [StringComparison]::Ordinal)
            if ($end -lt 0) {
                [void]$sb.Append($ch)
                $pos++
                continue
            }
            $end += 3
            [void]$sb.Append($html.Substring($pos, $end - $pos))
            $pos = $end
            continue
        }

        $mClose = $rxClose.Match($rest)
        if ($mClose.Success) {
            $tagLen = $mClose.Length
            if ($list.Count -gt 0) { [void]$list.RemoveAt($list.Count - 1) }
            [void]$sb.Append($html.Substring($pos, $tagLen))
            $pos += $tagLen
            continue
        }

        $mOpen = $rxOpenBlock.Match($rest)
        if ($mOpen.Success) {
            $tagLen = $mOpen.Length
            $attrs = $mOpen.Groups[2].Value
            $isGri = $attrs -match '\bcerceve-kutu\b'
            [void]$list.Add([bool]$isGri)
            [void]$sb.Append($html.Substring($pos, $tagLen))
            $pos += $tagLen
            continue
        }

        $mH2 = $rxH2Open.Match($rest)
        if ($mH2.Success) {
            $tagLen = $mH2.Length
            $attrs = $mH2.Groups[1].Value
            if ($attrs -match '\bkutu-baslik\b') {
                $insideGri = $list.Contains($true)
                $newCls = if ($insideGri) { 'gri-cerceve-baslik' } else { 'sayfa-bolum-basligi' }
                $newAttrs = [regex]::Replace($attrs, '\bkutu-baslik\b', $newCls)
                [void]$sb.Append('<h2' + $newAttrs + '>')
                $pos += $tagLen
                continue
            }
        }

        $mAny = $rxAnyTag.Match($rest)
        if ($mAny.Success) {
            $tagLen = $mAny.Length
            [void]$sb.Append($html.Substring($pos, $tagLen))
            $pos += $tagLen
            continue
        }

        [void]$sb.Append($ch)
        $pos++
    }

    return $sb.ToString()
}

$r = '<h2 class="kutu-baslik sss-baslik">A</h2>'
Write-Output "match h2: $($r -match '^(?i)<h2(\s[^>]*)>')"
Write-Output "G1: $($Matches[1])"

$s0 = '<h2 class="kutu-baslik">T</h2>'
Write-Output "only h2 OUT: $(Migrate-H2KutuInHtml $s0)"

$s = '<div class="cerceve-kutu"><h2 class="kutu-baslik sss-baslik">A</h2></div><h2 class="kutu-baslik">B</h2>'
$out = Migrate-H2KutuInHtml $s
Write-Output "IN:  $s"
Write-Output "OUT: $out"
