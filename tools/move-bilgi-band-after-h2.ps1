# Bilgi istek bandını (kirmizi-kutu) iletisim-form-alani içine, h2'den hemen sonra taşır.
$utf8 = New-Object System.Text.UTF8Encoding $false
$root = Split-Path -Parent $PSScriptRoot
if (-not (Test-Path (Join-Path $root 'index.html'))) { $root = $PSScriptRoot }
Set-Location $root

$rx = [regex]'(?s)(<div class="kirmizi-kutu[^"]*">.*?</div>)(\s*)(<section class="iletisim-form-alani[^"]*"[^>]*>\s*<h2[^>]*>.*?</h2>\s*)'
$n = 0
Get-ChildItem -Path . -Recurse -Filter '*.html' | ForEach-Object {
    $path = $_.FullName
    $raw = [IO.File]::ReadAllText($path, $utf8)
    if ($raw -notmatch 'iletisim-form-alani') { return }
    if ($raw -notmatch 'kirmizi-kutu') { return }
    $m = $rx.Match($raw)
    if (-not $m.Success) { return }
    $new = $rx.Replace($raw, '${3}${1}', 1)
    if ($new -ne $raw) {
        [IO.File]::WriteAllText($path, $new, $utf8)
        $script:n++
        Write-Output $path
    }
}
Write-Output "--- moved in $n files ---"
