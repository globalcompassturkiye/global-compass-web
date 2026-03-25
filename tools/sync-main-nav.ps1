# Syncs <nav class="navigasyon" id="nav-menu"> across all pages from tools/nav-main-fragment.html (UTF-8).
# Run: powershell -ExecutionPolicy Bypass -File tools/sync-main-nav.ps1
# Bu dosya UTF-8 BOM ile kaydedilmelidir (Turkce Replace dizeleri icin).

$ErrorActionPreference = 'Stop'
# tools/ -> repo root
$RepoRoot = Split-Path -Parent $PSScriptRoot
if (-not (Test-Path (Join-Path $RepoRoot 'index.html'))) {
  $RepoRoot = (Get-Location).Path
}

$Utf8NoBom = New-Object System.Text.UTF8Encoding $false
$NavTemplatePath = Join-Path $PSScriptRoot 'nav-main-fragment.html'
if (-not (Test-Path $NavTemplatePath)) { throw "Missing: $NavTemplatePath" }
# Ana Sayfa aktif degil (sayfa bazinda Build-NavForUrl ekler)
# Ilk satirda <nav oncesi bosluk yok; HTML'de tek satir girintisi icin prefix eklenir
$NAV_RAW = [System.IO.File]::ReadAllText($NavTemplatePath, $Utf8NoBom).TrimEnd()
$NAV_BASE = "            $NAV_RAW"

function Get-SiteUrl {
  param([string]$FilePath, [string]$Root)
  $r = $Root.TrimEnd('\', '/')
  $fp = $FilePath
  if ($fp.Length -le $r.Length) { throw "Path under root expected: $FilePath" }
  $rel = $fp.Substring($r.Length).TrimStart('\').Replace('\', '/')
  if ($rel -eq 'index.html') { return '/' }
  if ($rel.EndsWith('/index.html', [StringComparison]::OrdinalIgnoreCase)) {
    $dir = $rel.Substring(0, $rel.Length - '/index.html'.Length).TrimEnd('/') + '/'
    return '/' + $dir.TrimStart('/')
  }
  return '/' + $rel
}

function Add-Cls([string]$s, [string]$needle, [string]$insertBefore) {
  if ($s.Contains($needle)) { return $s.Replace($needle, $insertBefore) }
  return $s
}

function Build-NavForUrl([string]$u) {
  $n = $NAV_BASE

  if ($u -eq '/') {
    return (Add-Cls $n '<li><a href="/">Ana Sayfa</a></li>' '<li><a href="/" class="aktif">Ana Sayfa</a></li>')
  }

  $path = $u
  if ($path -ne '/' -and -not $path.EndsWith('/')) { $path = $path + '/' }

  # --- Lise ---
  if ($path -like '/yurt-disi-lise/degisim-programlari*') {
    $n = Add-Cls $n '<a href="/yurt-disi-lise/" aria-haspopup="true" aria-expanded="false">Lise</a>' '<a href="/yurt-disi-lise/" class="aktif" aria-haspopup="true" aria-expanded="false">Lise</a>'
    $n = Add-Cls $n '<a href="/yurt-disi-lise/degisim-programlari/">Değişim Programları</a>' '<a href="/yurt-disi-lise/degisim-programlari/" class="aktif">Değişim Programları</a>'
    return $n
  }
  if ($path -like '/yurt-disi-lise*') {
    $n = Add-Cls $n '<a href="/yurt-disi-lise/" aria-haspopup="true" aria-expanded="false">Lise</a>' '<a href="/yurt-disi-lise/" class="aktif" aria-haspopup="true" aria-expanded="false">Lise</a>'
    if ($path -eq '/yurt-disi-lise/') {
      $n = Add-Cls $n '<a href="/yurt-disi-lise/">Tümü</a>' '<a href="/yurt-disi-lise/" class="aktif">Tümü</a>'
    }
    return $n
  }

  # --- Tekil üst linkler ---
  if ($path -like '/yurt-disi-universite*') {
    return (Add-Cls $n '<a href="/yurt-disi-universite/">Üniversite</a>' '<a href="/yurt-disi-universite/" class="aktif">Üniversite</a>')
  }
  if ($path -like '/yurt-disi-yuksek-lisans-mba*') {
    return (Add-Cls $n '<a href="/yurt-disi-yuksek-lisans-mba/">Yüksek Lisans & MBA</a>' '<a href="/yurt-disi-yuksek-lisans-mba/" class="aktif">Yüksek Lisans & MBA</a>')
  }
  if ($path -like '/yurt-disi-online-egitim*') {
    return (Add-Cls $n '<a href="/yurt-disi-online-egitim/">Online Eğitim</a>' '<a href="/yurt-disi-online-egitim/" class="aktif">Online Eğitim</a>')
  }
  if ($path -like '/yurt-disi-burs-firsatlari*') {
    return (Add-Cls $n '<a href="/yurt-disi-burs-firsatlari/">Burs Fırsatları</a>' '<a href="/yurt-disi-burs-firsatlari/" class="aktif">Burs Fırsatları</a>')
  }

  # --- Dil Okulları (önce şehir, sonra ülke, sonra kök) ---
  $dilRoot = '<a href="/yurt-disi-dil-okullari/" aria-haspopup="true" aria-expanded="false">Dil Okulları</a>'
  $dilRootA = '<a href="/yurt-disi-dil-okullari/" class="aktif" aria-haspopup="true" aria-expanded="false">Dil Okulları</a>'

  if ($path -like '/yurt-disi-dil-okullari*') {
    $n = Add-Cls $n $dilRoot $dilRootA
  }

  if ($path -like '/yurt-disi-dil-okullari/uk/london*') {
    $n = Add-Cls $n '<a href="/yurt-disi-dil-okullari/uk/" aria-haspopup="true" aria-expanded="false">İngiltere</a>' '<a href="/yurt-disi-dil-okullari/uk/" class="aktif" aria-haspopup="true" aria-expanded="false">İngiltere</a>'
    $n = Add-Cls $n '<a href="/yurt-disi-dil-okullari/uk/london/">Londra</a>' '<a href="/yurt-disi-dil-okullari/uk/london/" class="aktif">Londra</a>'
    return $n
  }
  if ($path -like '/yurt-disi-dil-okullari/uk/oxford*') {
    $n = Add-Cls $n '<a href="/yurt-disi-dil-okullari/uk/" aria-haspopup="true" aria-expanded="false">İngiltere</a>' '<a href="/yurt-disi-dil-okullari/uk/" class="aktif" aria-haspopup="true" aria-expanded="false">İngiltere</a>'
    $n = Add-Cls $n '<a href="/yurt-disi-dil-okullari/uk/oxford/">Oxford</a>' '<a href="/yurt-disi-dil-okullari/uk/oxford/" class="aktif">Oxford</a>'
    return $n
  }
  if ($path -like '/yurt-disi-dil-okullari/uk/bournemouth*') {
    $n = Add-Cls $n '<a href="/yurt-disi-dil-okullari/uk/" aria-haspopup="true" aria-expanded="false">İngiltere</a>' '<a href="/yurt-disi-dil-okullari/uk/" class="aktif" aria-haspopup="true" aria-expanded="false">İngiltere</a>'
    $n = Add-Cls $n '<a href="/yurt-disi-dil-okullari/uk/bournemouth/">Bournemouth</a>' '<a href="/yurt-disi-dil-okullari/uk/bournemouth/" class="aktif">Bournemouth</a>'
    return $n
  }
  if ($path -like '/yurt-disi-dil-okullari/usa/boston*') {
    $n = Add-Cls $n '<a href="/yurt-disi-dil-okullari/usa/" aria-haspopup="true" aria-expanded="false">Amerika</a>' '<a href="/yurt-disi-dil-okullari/usa/" class="aktif" aria-haspopup="true" aria-expanded="false">Amerika</a>'
    $n = Add-Cls $n '<a href="/yurt-disi-dil-okullari/usa/boston/">Boston</a>' '<a href="/yurt-disi-dil-okullari/usa/boston/" class="aktif">Boston</a>'
    return $n
  }
  if ($path -like '/yurt-disi-dil-okullari/usa/los-angeles*') {
    $n = Add-Cls $n '<a href="/yurt-disi-dil-okullari/usa/" aria-haspopup="true" aria-expanded="false">Amerika</a>' '<a href="/yurt-disi-dil-okullari/usa/" class="aktif" aria-haspopup="true" aria-expanded="false">Amerika</a>'
    $n = Add-Cls $n '<a href="/yurt-disi-dil-okullari/usa/los-angeles/">Los Angeles</a>' '<a href="/yurt-disi-dil-okullari/usa/los-angeles/" class="aktif">Los Angeles</a>'
    return $n
  }
  if ($path -like '/yurt-disi-dil-okullari/usa/new-york*') {
    $n = Add-Cls $n '<a href="/yurt-disi-dil-okullari/usa/" aria-haspopup="true" aria-expanded="false">Amerika</a>' '<a href="/yurt-disi-dil-okullari/usa/" class="aktif" aria-haspopup="true" aria-expanded="false">Amerika</a>'
    $n = Add-Cls $n '<a href="/yurt-disi-dil-okullari/usa/new-york/">New York</a>' '<a href="/yurt-disi-dil-okullari/usa/new-york/" class="aktif">New York</a>'
    return $n
  }
  if ($path -like '/yurt-disi-dil-okullari/uk/*') {
    $n = Add-Cls $n '<a href="/yurt-disi-dil-okullari/uk/" aria-haspopup="true" aria-expanded="false">İngiltere</a>' '<a href="/yurt-disi-dil-okullari/uk/" class="aktif" aria-haspopup="true" aria-expanded="false">İngiltere</a>'
    return $n
  }
  if ($path -like '/yurt-disi-dil-okullari/usa/*') {
    $n = Add-Cls $n '<a href="/yurt-disi-dil-okullari/usa/" aria-haspopup="true" aria-expanded="false">Amerika</a>' '<a href="/yurt-disi-dil-okullari/usa/" class="aktif" aria-haspopup="true" aria-expanded="false">Amerika</a>'
    return $n
  }
  if ($path -like '/yurt-disi-dil-okullari*') {
    $n = Add-Cls $n '<li><a href="/yurt-disi-dil-okullari/">Tümü</a></li>' '<li><a href="/yurt-disi-dil-okullari/" class="aktif">Tümü</a></li>'
    return $n
  }

  # --- Yaz Okulları ---
  $yazRoot = '<a href="/yurt-disi-yaz-okullari/" aria-haspopup="true" aria-expanded="false">Yaz Okulları</a>'
  $yazRootA = '<a href="/yurt-disi-yaz-okullari/" class="aktif" aria-haspopup="true" aria-expanded="false">Yaz Okulları</a>'

  if ($path -like '/yurt-disi-yaz-okullari*') {
    $n = Add-Cls $n $yazRoot $yazRootA
  }

  if ($path -like '/yurt-disi-yaz-okullari/uk/london*') {
    $n = Add-Cls $n '<a href="/yurt-disi-yaz-okullari/uk/" aria-haspopup="true" aria-expanded="false">İngiltere</a>' '<a href="/yurt-disi-yaz-okullari/uk/" class="aktif" aria-haspopup="true" aria-expanded="false">İngiltere</a>'
    $n = Add-Cls $n '<a href="/yurt-disi-yaz-okullari/uk/london/">Londra</a>' '<a href="/yurt-disi-yaz-okullari/uk/london/" class="aktif">Londra</a>'
    return $n
  }
  if ($path -like '/yurt-disi-yaz-okullari/uk/oxford*') {
    $n = Add-Cls $n '<a href="/yurt-disi-yaz-okullari/uk/" aria-haspopup="true" aria-expanded="false">İngiltere</a>' '<a href="/yurt-disi-yaz-okullari/uk/" class="aktif" aria-haspopup="true" aria-expanded="false">İngiltere</a>'
    $n = Add-Cls $n '<a href="/yurt-disi-yaz-okullari/uk/oxford/">Oxford</a>' '<a href="/yurt-disi-yaz-okullari/uk/oxford/" class="aktif">Oxford</a>'
    return $n
  }
  if ($path -like '/yurt-disi-yaz-okullari/uk/cambridge*') {
    $n = Add-Cls $n '<a href="/yurt-disi-yaz-okullari/uk/" aria-haspopup="true" aria-expanded="false">İngiltere</a>' '<a href="/yurt-disi-yaz-okullari/uk/" class="aktif" aria-haspopup="true" aria-expanded="false">İngiltere</a>'
    $n = Add-Cls $n '<a href="/yurt-disi-yaz-okullari/uk/cambridge/">Cambridge</a>' '<a href="/yurt-disi-yaz-okullari/uk/cambridge/" class="aktif">Cambridge</a>'
    return $n
  }
  if ($path -like '/yurt-disi-yaz-okullari/uk/bournemouth*') {
    $n = Add-Cls $n '<a href="/yurt-disi-yaz-okullari/uk/" aria-haspopup="true" aria-expanded="false">İngiltere</a>' '<a href="/yurt-disi-yaz-okullari/uk/" class="aktif" aria-haspopup="true" aria-expanded="false">İngiltere</a>'
    $n = Add-Cls $n '<a href="/yurt-disi-yaz-okullari/uk/bournemouth/">Bournemouth</a>' '<a href="/yurt-disi-yaz-okullari/uk/bournemouth/" class="aktif">Bournemouth</a>'
    return $n
  }
  if ($path -like '/yurt-disi-yaz-okullari/germany/frankfurt*') {
    $n = Add-Cls $n '<a href="/yurt-disi-yaz-okullari/germany/" aria-haspopup="true" aria-expanded="false">Almanya</a>' '<a href="/yurt-disi-yaz-okullari/germany/" class="aktif" aria-haspopup="true" aria-expanded="false">Almanya</a>'
    $n = Add-Cls $n '<a href="/yurt-disi-yaz-okullari/germany/frankfurt/">Frankfurt</a>' '<a href="/yurt-disi-yaz-okullari/germany/frankfurt/" class="aktif">Frankfurt</a>'
    return $n
  }
  if ($path -like '/yurt-disi-yaz-okullari/germany/freiburg*') {
    $n = Add-Cls $n '<a href="/yurt-disi-yaz-okullari/germany/" aria-haspopup="true" aria-expanded="false">Almanya</a>' '<a href="/yurt-disi-yaz-okullari/germany/" class="aktif" aria-haspopup="true" aria-expanded="false">Almanya</a>'
    $n = Add-Cls $n '<a href="/yurt-disi-yaz-okullari/germany/freiburg/">Freiburg</a>' '<a href="/yurt-disi-yaz-okullari/germany/freiburg/" class="aktif">Freiburg</a>'
    return $n
  }
  if ($path -like '/yurt-disi-yaz-okullari/canada/toronto*') {
    $n = Add-Cls $n '<a href="/yurt-disi-yaz-okullari/canada/" aria-haspopup="true" aria-expanded="false">Kanada</a>' '<a href="/yurt-disi-yaz-okullari/canada/" class="aktif" aria-haspopup="true" aria-expanded="false">Kanada</a>'
    $n = Add-Cls $n '<a href="/yurt-disi-yaz-okullari/canada/toronto/">Toronto</a>' '<a href="/yurt-disi-yaz-okullari/canada/toronto/" class="aktif">Toronto</a>'
    return $n
  }
  if ($path -like '/yurt-disi-yaz-okullari/italy/milan*') {
    $n = Add-Cls $n '<a href="/yurt-disi-yaz-okullari/italy/" aria-haspopup="true" aria-expanded="false">İtalya</a>' '<a href="/yurt-disi-yaz-okullari/italy/" class="aktif" aria-haspopup="true" aria-expanded="false">İtalya</a>'
    $n = Add-Cls $n '<a href="/yurt-disi-yaz-okullari/italy/milan/">Milano</a>' '<a href="/yurt-disi-yaz-okullari/italy/milan/" class="aktif">Milano</a>'
    return $n
  }
  if ($path -like '/yurt-disi-yaz-okullari/usa/new-york*') {
    $n = Add-Cls $n '<a href="/yurt-disi-yaz-okullari/usa/" aria-haspopup="true" aria-expanded="false">Amerika</a>' '<a href="/yurt-disi-yaz-okullari/usa/" class="aktif" aria-haspopup="true" aria-expanded="false">Amerika</a>'
    $n = Add-Cls $n '<a href="/yurt-disi-yaz-okullari/usa/new-york/">New York</a>' '<a href="/yurt-disi-yaz-okullari/usa/new-york/" class="aktif">New York</a>'
    return $n
  }
  if ($path -like '/yurt-disi-yaz-okullari/switzerland*') {
    $n = Add-Cls $n '<a href="/yurt-disi-yaz-okullari/switzerland/">İsviçre</a>' '<a href="/yurt-disi-yaz-okullari/switzerland/" class="aktif">İsviçre</a>'
    return $n
  }
  if ($path -like '/yurt-disi-yaz-okullari/uk/*') {
    $n = Add-Cls $n '<a href="/yurt-disi-yaz-okullari/uk/" aria-haspopup="true" aria-expanded="false">İngiltere</a>' '<a href="/yurt-disi-yaz-okullari/uk/" class="aktif" aria-haspopup="true" aria-expanded="false">İngiltere</a>'
    return $n
  }
  if ($path -like '/yurt-disi-yaz-okullari/germany/*') {
    $n = Add-Cls $n '<a href="/yurt-disi-yaz-okullari/germany/" aria-haspopup="true" aria-expanded="false">Almanya</a>' '<a href="/yurt-disi-yaz-okullari/germany/" class="aktif" aria-haspopup="true" aria-expanded="false">Almanya</a>'
    return $n
  }
  if ($path -like '/yurt-disi-yaz-okullari/canada/*') {
    $n = Add-Cls $n '<a href="/yurt-disi-yaz-okullari/canada/" aria-haspopup="true" aria-expanded="false">Kanada</a>' '<a href="/yurt-disi-yaz-okullari/canada/" class="aktif" aria-haspopup="true" aria-expanded="false">Kanada</a>'
    return $n
  }
  if ($path -like '/yurt-disi-yaz-okullari/italy/*') {
    $n = Add-Cls $n '<a href="/yurt-disi-yaz-okullari/italy/" aria-haspopup="true" aria-expanded="false">İtalya</a>' '<a href="/yurt-disi-yaz-okullari/italy/" class="aktif" aria-haspopup="true" aria-expanded="false">İtalya</a>'
    return $n
  }
  if ($path -like '/yurt-disi-yaz-okullari/usa/*') {
    $n = Add-Cls $n '<a href="/yurt-disi-yaz-okullari/usa/" aria-haspopup="true" aria-expanded="false">Amerika</a>' '<a href="/yurt-disi-yaz-okullari/usa/" class="aktif" aria-haspopup="true" aria-expanded="false">Amerika</a>'
    return $n
  }
  if ($path -like '/yurt-disi-yaz-okullari*') {
    $n = Add-Cls $n '<li><a href="/yurt-disi-yaz-okullari/">Tümü</a></li>' '<li><a href="/yurt-disi-yaz-okullari/" class="aktif">Tümü</a></li>'
    return $n
  }

  return $n
}

# Satir kirilimi + <nav oncesi fazla bosluklari da tek blokta yakala (cift girinti onleme)
$navPattern = [regex]::new('(?s)(\r?\n)(\s*)<nav class="navigasyon" id="nav-menu"[^>]*>.*?</nav>')
$files = Get-ChildItem -Path $RepoRoot -Filter '*.html' -Recurse -File | Where-Object {
  $_.FullName -notmatch '\\node_modules\\' -and $_.FullName -notmatch '\\tools\\'
}
$changed = 0
foreach ($f in $files) {
  $text = [System.IO.File]::ReadAllText($f.FullName, [System.Text.Encoding]::UTF8)
  if ($text -notmatch '<nav class="navigasyon" id="nav-menu"') { continue }
  $url = Get-SiteUrl -FilePath $f.FullName -Root $RepoRoot
  $newNav = (Build-NavForUrl $url).TrimEnd("`r`n")
  $navForFile = "            " + $newNav.TrimStart()
  $m = $navPattern.Match($text)
  if (-not $m.Success) {
    Write-Warning "Nav pattern not found: $($f.FullName)"
    continue
  }
  $newText = $text.Substring(0, $m.Index) + $m.Groups[1].Value + $navForFile + $text.Substring($m.Index + $m.Length)
  if ($newText -ne $text) {
    [System.IO.File]::WriteAllText($f.FullName, $newText, [System.Text.UTF8Encoding]::new($false))
    $changed++
  }
}

Write-Host "Updated $changed HTML file(s). Repo: $RepoRoot"
