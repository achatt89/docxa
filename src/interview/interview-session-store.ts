import fs from 'fs/promises';
import path from 'path';
import { InterviewSession, InterviewSessionSchema } from './interview-schema.js';

export class InterviewSessionStore {
  private sessionsDir: string;
  private normalizedDir: string;

  constructor(workspaceDir: string) {
    this.sessionsDir = path.join(workspaceDir, '.docxa', 'interviews', 'sessions');
    this.normalizedDir = path.join(workspaceDir, '.docxa', 'interviews', 'normalized');
  }

  async init(): Promise<void> {
    await fs.mkdir(this.sessionsDir, { recursive: true });
    await fs.mkdir(this.normalizedDir, { recursive: true });
  }

  async saveSession(session: InterviewSession): Promise<void> {
    const filePath = path.join(this.sessionsDir, `${session.sessionId}.json`);
    await fs.writeFile(filePath, JSON.stringify(session, null, 2));
  }

  async loadSession(sessionId: string): Promise<InterviewSession | undefined> {
    const filePath = path.join(this.sessionsDir, `${sessionId}.json`);
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const json = JSON.parse(content);
      return InterviewSessionSchema.parse(json);
    } catch (_error) {
      return undefined;
    }
  }

  async listSessions(): Promise<InterviewSession[]> {
    try {
      const files = await fs.readdir(this.sessionsDir);
      const sessions: InterviewSession[] = [];
      for (const file of files) {
        if (file.endsWith('.json')) {
          const sessionId = path.basename(file, '.json');
          const session = await this.loadSession(sessionId);
          if (session) {
            sessions.push(session);
          }
        }
      }
      return sessions;
    } catch (_error) {
      return [];
    }
  }

  async deleteSession(sessionId: string): Promise<void> {
    const filePath = path.join(this.sessionsDir, `${sessionId}.json`);
    try {
      await fs.unlink(filePath);
    } catch (_error) {
      // Ignore if doesn't exist
    }
  }

  async saveNormalizedAnswers(sessionId: string, answers: Record<string, any>): Promise<void> {
    const filePath = path.join(this.normalizedDir, `${sessionId}.normalized.json`);
    await fs.writeFile(filePath, JSON.stringify(answers, null, 2));
  }
}
