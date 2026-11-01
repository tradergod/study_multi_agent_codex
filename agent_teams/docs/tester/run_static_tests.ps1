param(
  [string]$IndexPath = (Join-Path $PSScriptRoot '..\..\index.html')
)

$ErrorActionPreference = 'Stop'
$html = Get-Content -Raw -Encoding UTF8 $IndexPath
$failures = [System.Collections.Generic.List[string]]::new()

function Assert-True([bool]$Condition, [string]$Message) {
  if (-not $Condition) { $failures.Add($Message) }
}

Assert-True (($html | Select-String -Pattern '<h1\b' -AllMatches).Matches.Count -eq 1) 'TEST-003: h1 must exist exactly once.'
Assert-True ($html.Contains('id="app-list"')) 'TEST-003: #app-list is missing.'
Assert-True ($html.Contains('id="detail-panel"')) 'TEST-003: #detail-panel is missing.'
Assert-True (($html | Select-String -Pattern '<style\b' -AllMatches).Matches.Count -eq 1) 'TEST-003: exactly one style block is required.'
Assert-True (($html | Select-String -Pattern '<script\b' -AllMatches).Matches.Count -eq 1) 'TEST-003: exactly one script block is required.'
Assert-True ($html.Contains('grid-template-columns: minmax(280px, 360px) 1fr')) 'TEST-003: fixed two-column layout is missing.'
Assert-True ($html.Contains('data-priority="${request.priority}"')) 'TEST-001: priority badge contract is missing.'
Assert-True ($html.Contains('id="detail-needs-review"') -and $html.Contains('dataset.needsReview')) 'TEST-002: detail review-state attribute contract is missing.'
Assert-True ($html.Contains('new URLSearchParams(location.search).get("empty") === "1"')) 'TEST-007: empty-state URL hook is missing.'

if ($failures.Count -gt 0) {
  $failures | ForEach-Object { Write-Error $_ }
  exit 1
}

Write-Output "Static contract checks passed: $IndexPath"
