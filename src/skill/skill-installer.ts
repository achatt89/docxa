import fs from 'fs/promises';
import path from 'path';
import os from 'os';

const SKILL_DIR_NAME = 'docxa';
const SKILL_FILE_NAME = 'SKILL.md';

function getClaudeSkillsDir(): string {
  return path.join(os.homedir(), '.claude', 'skills');
}

function getSkillDir(): string {
  return path.join(getClaudeSkillsDir(), SKILL_DIR_NAME);
}

function getSkillFilePath(): string {
  return path.join(getSkillDir(), SKILL_FILE_NAME);
}

export interface SkillStatus {
  installed: boolean;
  skillPath: string;
  claudeDir: string;
}

export async function getSkillStatus(): Promise<SkillStatus> {
  const skillPath = getSkillFilePath();
  const claudeDir = getClaudeSkillsDir();
  let installed: boolean;
  try {
    await fs.access(skillPath);
    installed = true;
  } catch {
    installed = false;
  }
  return { installed, skillPath, claudeDir };
}

export async function installSkill(content: string): Promise<string> {
  const skillDir = getSkillDir();
  await fs.mkdir(skillDir, { recursive: true });
  const skillPath = getSkillFilePath();
  await fs.writeFile(skillPath, content, 'utf-8');
  return skillPath;
}

export async function uninstallSkill(): Promise<boolean> {
  const skillDir = getSkillDir();
  try {
    await fs.rm(skillDir, { recursive: true, force: true });
    return true;
  } catch {
    return false;
  }
}
