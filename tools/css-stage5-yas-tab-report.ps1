#Requires -Version 5.1
<#
.SYNOPSIS
  Aşama 5 — Yas-tab (radyo sekme) ve ilgili mega-secici yogunlugu: style.css satir isabetleri,
  immerse-shared.css ile kural kopyasi uyumu (yas-tab-alani-standardi), HTML kullanan sayfalar.
  tools/css-stage5-yas-tab-report.json yazar.

.KULLANIM
  powershell -NoProfile -ExecutionPolicy Bypass -File tools/css-stage5-yas-tab-report.ps1
#>
param(
    [string]$RepoRoot = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
)
$ErrorActionPreference = 'Stop'
$outPath = Join-Path $PSScriptRoot 'css-stage5-yas-tab-report.json'
$stylePath = Join-Path $RepoRoot 'css\style.css'
$immersePath = Join-Path $RepoRoot 'css\immerse-shared.css'

function Get-LineStats([string]$filePath) {
    if (-not (Test-Path -LiteralPath $filePath)) {
        return $null
    }
    $lines = [System.IO.File]::ReadAllLines($filePath, [System.Text.UTF8Encoding]::new($false))
    $bytes = (Get-Item -LiteralPath $filePath).Length
    $rxYas = '(?i)(yas-tab|yas-tabs|yas-tab-input|yas-tab-etiket|yas-tab-icerik|geziler-tab|sayfa-konusu-tab)'
    $rxIdYas = '#yas[0-9]'
    $rxChecked = ':checked'
    $hitYas = 0
    $hitIdYas = 0
    $hitCheckedYas = 0
    foreach ($ln in $lines) {
        if ($ln -match $rxYas) { $hitYas++ }
        if ($ln -match $rxIdYas) { $hitIdYas++ }
        if ($ln -match $rxChecked -and $ln -match $rxYas) { $hitCheckedYas++ }
    }
    return [pscustomobject]@{
        file                 = ($filePath.Substring($RepoRoot.Length).TrimStart('\').Replace('\', '/'))
        bytes                = $bytes
        total_lines          = $lines.Count
        lines_match_yas_tab  = $hitYas
        lines_match_hash_yas = $hitIdYas
        lines_checked_plus_yas = $hitCheckedYas
    }
}

$styleStats = Get-LineStats $stylePath
$immerseStats = Get-LineStats $immersePath

$htmlWithYas = New-Object System.Collections.Generic.List[string]
Get-ChildItem -LiteralPath $RepoRoot -Recurse -Filter 'index.html' -File -ErrorAction SilentlyContinue |
    Where-Object { $_.FullName -notmatch '[\\/]tools[\\/]' } |
    ForEach-Object {
        $raw = [System.IO.File]::ReadAllText($_.FullName, [System.Text.UTF8Encoding]::new($false))
        if ($raw -match '(?i)yas-tabs-kapsayici|yas-tab-input') {
            $rel = $_.FullName.Substring($RepoRoot.Length).TrimStart('\').Replace('\', '/')
            [void]$htmlWithYas.Add($rel)
        }
    }

$htmlWithImmerseShared = New-Object System.Collections.Generic.List[string]
Get-ChildItem -LiteralPath $RepoRoot -Recurse -Filter 'index.html' -File -ErrorAction SilentlyContinue |
    Where-Object { $_.FullName -notmatch '[\\/]tools[\\/]' } |
    ForEach-Object {
        $raw = [System.IO.File]::ReadAllText($_.FullName, [System.Text.UTF8Encoding]::new($false))
        if ($raw -match 'immerse-shared\.css') {
            $rel = $_.FullName.Substring($RepoRoot.Length).TrimStart('\').Replace('\', '/')
            [void]$htmlWithImmerseShared.Add($rel)
        }
    }

$both = @($htmlWithYas | Where-Object { $htmlWithImmerseShared -contains $_ })

$mirrorGap = $false
if ($immerseStats -and $immerseStats.lines_match_yas_tab -eq 0 -and $styleStats.lines_match_yas_tab -gt 0) {
    $mirrorGap = $true
}

$payload = @{
    schema                    = 'global-compass-css-stage5-yas-tab/1'
    generated_at              = (Get-Date -Format 'yyyy-MM-ddTHH:mm:ssK')
    rule_reference            = '.cursor/rules/yas-tab-alani-standardi.mdc'
    style_css                 = $styleStats
    immerse_shared_css        = $immerseStats
    html_summary              = @{
        pages_with_yas_tab_markup      = $htmlWithYas.Count
        pages_linking_immerse_shared   = $htmlWithImmerseShared.Count
        pages_both_yas_and_immerse_link = $both.Count
    }
    html_with_yas_tab_sample  = @($htmlWithYas | Sort-Object | Select-Object -First 25)
    mirror_status             = @{
        style_has_yas_tab_lines        = if ($styleStats) { $styleStats.lines_match_yas_tab } else { 0 }
        immerse_shared_yas_tab_lines   = if ($immerseStats) { $immerseStats.lines_match_yas_tab } else { 0 }
        mirror_gap_flag                = [bool]$mirrorGap
        mirror_gap_note                = if ($mirrorGap) {
            'immerse-shared.css has no yas-tab lines while style.css does. Per yas-tab-alani-standardi: mirror rules if a page loads immerse-shared without style.css; most pages load both - confirm templates.'
        }
        else {
            'Either immerse-shared already contains yas-tab CSS, or style.css has no yas-tab line hits.'
        }
    }
    related_tools             = @{
        mega_stage2 = 'tools/css-mega-selectors-stage2-report.ps1'
        stage3      = 'tools/css-modules-stage3-inventory.ps1'
    }
    notes                     = @(
        'Mega-selector debt for age tabs: see css-mega-selectors-stage2-report.json top_by_pain_score.',
        'Do not conflate with ana sayfa hizmet-tab (tab.css); yas-tab-alani-standardi applies to content pages.'
    )
}

$json = ($payload | ConvertTo-Json -Depth 8)
[System.IO.File]::WriteAllText($outPath, $json + "`n", [System.Text.UTF8Encoding]::new($false))

Write-Host "=== Stage 5 yas-tab inventory ==="
Write-Host "Wrote: $outPath"
Write-Host "HTML with yas-tab markup: $($htmlWithYas.Count) | Pages linking immerse-shared.css: $($htmlWithImmerseShared.Count)"
Write-Host "style.css lines (yas-tab* etc.): $($styleStats.lines_match_yas_tab) | immerse-shared same: $($immerseStats.lines_match_yas_tab) | mirror_gap: $mirrorGap"
