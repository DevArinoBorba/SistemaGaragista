param(
  [ValidateSet('dev', 'start')][string]$Mode = 'dev',
  [int]$PreferredPort = 3000
)

$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path $PSScriptRoot -Parent
$policyPath = Join-Path $env:USERPROFILE '.maestri/PORT_POLICY.md'
$checkerPath = Join-Path $env:USERPROFILE '.maestri/Find-FreePort.ps1'
if (!(Test-Path -LiteralPath $policyPath) -or !(Test-Path -LiteralPath $checkerPath)) {
  throw 'Maestri port policy/checker unavailable. Configure the local port policy before starting services.'
}
Get-Content -LiteralPath $policyPath -Raw | Out-Null
$lease = & $checkerPath -Preferred $PreferredPort -Service "garagista-$Mode" -Project $projectRoot | ConvertFrom-Json
if (!$lease.port -or !$lease.leaseId) { throw 'Port checker did not return a valid reservation.' }
try {
  if ($Mode -eq 'dev' -or !$env:BETTER_AUTH_URL) { $env:BETTER_AUTH_URL = "http://127.0.0.1:$($lease.port)" }
  Write-Host "Garagista: http://127.0.0.1:$($lease.port)"
  & node (Join-Path $projectRoot 'node_modules/next/dist/bin/next') $Mode --hostname 127.0.0.1 --port $lease.port
  $serverExitCode = $LASTEXITCODE
} finally {
  & $checkerPath -ReleaseLeaseId $lease.leaseId | Out-Null
}
exit $serverExitCode
