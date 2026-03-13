#Requires -Version 5.1

$SkillDir = Join-Path $env:USERPROFILE ".claude\skills\docxa"

if (Test-Path $SkillDir) {
    Remove-Item -Path $SkillDir -Recurse -Force
    Write-Host "OK Docxa skill removed from $SkillDir" -ForegroundColor Green
} else {
    Write-Host "Docxa skill is not installed at $SkillDir"
}
