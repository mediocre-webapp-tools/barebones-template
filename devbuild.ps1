$ErrorActionPreference="SilentlyContinue"
Stop-Transcript | out-null
$ErrorActionPreference = "Continue"
$filename = Get-Date -Format "yyyyMMdd-hhss"
Start-Transcript -path "log/devbuild_$($filename).log" -append
gulp dev
Remove-Item .\tmp -Force -Recurse
Stop-Transcript