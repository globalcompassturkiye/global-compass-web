param([string]$Path)
$b = [System.IO.File]::ReadAllBytes($Path)
if ($b.Length -ge 3 -and $b[0] -eq 0xEF -and $b[1] -eq 0xBB -and $b[2] -eq 0xBF) {
  Write-Host 'BOM already present'
  exit 0
}
$nb = New-Object byte[] ($b.Length + 3)
[Array]::Copy([byte[]](0xEF, 0xBB, 0xBF), 0, $nb, 0, 3)
[Array]::Copy($b, 0, $nb, 3, $b.Length)
[System.IO.File]::WriteAllBytes($Path, $nb)
Write-Host 'BOM added'
