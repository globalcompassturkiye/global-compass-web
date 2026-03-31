$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$oldStrip = @"
                    <ul>
                        <li><a href="/hizmetlerimiz/">hizmetlerimiz</a></li>
"@
$newStrip = @"
                    <ul>
                        <li><a href="/blog/">Blog</a></li>
                        <li><a href="/hizmetlerimiz/">hizmetlerimiz</a></li>
"@
$n = 0
Get-ChildItem -Path $root -Recurse -Filter "*.html" -File | ForEach-Object {
  $p = $_.FullName
  $c = [System.IO.File]::ReadAllText($p)
  $orig = $c
  if ($c.Contains("yardimci-menu") -and $c.Contains($oldStrip)) {
    if ($c -notmatch 'yardimci-menu[\s\S]{0,600}<ul>\s*<li><a href="/blog/">Blog</a></li>') {
      $c = $c.Replace($oldStrip, $newStrip)
    }
  }
  $m = [regex]::Match($c, '(<nav class="navigasyon" id="nav-menu"[^>]*>)([\s\S]*?)(</nav>)')
  if ($m.Success) {
    $inner = $m.Groups[2].Value
    $inner2 = $inner -replace '\r?\n\s*<li><a href="/blog/" class="aktif">Blog</a></li>\s*', "`n"
    $inner2 = $inner2 -replace '\r?\n\s*<li><a href="/blog/">Blog</a></li>\s*', "`n"
    if ($inner2 -ne $inner) {
      $before = $c.Substring(0, $m.Index)
      $after = $c.Substring($m.Index + $m.Length)
      $c = $before + $m.Groups[1].Value + $inner2 + $m.Groups[3].Value + $after
    }
  }
  if ($c -ne $orig) {
    [System.IO.File]::WriteAllText($p, $c, [System.Text.UTF8Encoding]::new($false))
    $n++
  }
}
Write-Host "Patched $n files"
