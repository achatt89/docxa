#Requires -Version 5.1
<#
.SYNOPSIS
    Docxa Installer for Windows
.DESCRIPTION
    Installs the Docxa Claude Code skill for AI-powered documentation generation.
#>

$ErrorActionPreference = "Stop"

function Main {
    $SkillDir = Join-Path $env:USERPROFILE ".claude\skills\docxa"
    $RepoUrl = "https://github.com/achatt89/docxa"

    Write-Host "=================================="
    Write-Host "   Docxa - Installer"
    Write-Host "   Claude Code Documentation Skill"
    Write-Host "=================================="
    Write-Host ""

    # Check prerequisites
    if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
        Write-Host "X Git is required but not installed." -ForegroundColor Red
        exit 1
    }
    Write-Host "OK Git detected" -ForegroundColor Green

    # Create skill directory
    New-Item -ItemType Directory -Path $SkillDir -Force | Out-Null

    # Clone to temp directory
    $TempDir = Join-Path $env:TEMP "docxa-install-$(Get-Random)"

    Write-Host "Downloading Docxa..."

    try {
        $ErrorActionPreference = "Continue"
        git clone --depth 1 $RepoUrl "$TempDir\docxa" 2>&1 | Out-Null
        $ErrorActionPreference = "Stop"
        if ($LASTEXITCODE -ne 0) { throw "Git clone failed" }

        # Copy skill file
        Write-Host "Installing skill files..."
        Copy-Item "$TempDir\docxa\skill\SKILL.md" -Destination "$SkillDir\SKILL.md" -Force

        Write-Host ""
        Write-Host "Docxa skill installed successfully!" -ForegroundColor Green
        Write-Host ""
        Write-Host "  Installed:"
        Write-Host "    - 1 skill file (~/.claude/skills/docxa/SKILL.md)"
        Write-Host ""
        Write-Host "Usage:"
        Write-Host "  1. Start Claude Code:  claude"
        Write-Host "  2. Run:                /docxa"
        Write-Host "                         /docxa generate prd"
        Write-Host "                         /docxa interview"
        Write-Host "                         /docxa discover"
    }
    finally {
        if (Test-Path $TempDir) {
            Remove-Item -Path $TempDir -Recurse -Force -ErrorAction SilentlyContinue
        }
    }
}

Main
