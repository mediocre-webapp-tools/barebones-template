$ErrorActionPreference="SilentlyContinue"
Stop-Transcript | out-null
$ErrorActionPreference = "Continue"
$filename = Get-Date -Format "yyyyMMdd-hhss"
Start-Transcript -path "log/build_$($filename).log" -append
gulp build
Remove-Item .\tmp -Force -Recurse
Stop-Transcript