import { TemplateSystem } from '../generation/template-system.js';
import { TemplateBootstrap } from '../generation/template-bootstrap.js';
import { WorkspaceStore } from '../storage/workspace-store.js';
import { LLMWrapper } from '../utils/llm-wrapper.js';
import { loadEnv } from '../utils/env-loader.js';
import { resolveLLMConfig } from '../llm/llm-config.js';
import { InterviewLoader } from '../interview/interview-loader.js';
import { InterviewSessionStore } from '../interview/interview-session-store.js';

export interface RuntimeOptions {
  cwd: string;
  envFile?: string;
  interface?: 'cli' | 'vscode' | 'teams';
}

export interface DocxaRuntime {
  templateSystem: TemplateSystem;
  store: WorkspaceStore;
  sessionStore: InterviewSessionStore;
  interviewLoader: InterviewLoader;
  cwd: string;
  getLLM: () => LLMWrapper;
}

/**
 * Shared entry point to initialize Docxa services.
 * Reusable by CLI, VSCode, and Teams Copilot.
 */
export async function initializeRuntime(options: RuntimeOptions): Promise<DocxaRuntime> {
  const { cwd, envFile } = options;

  // 1. Load environment
  loadEnv({ cwd, envFile });

  // 2. Initialize Core Services
  const templateSystem = new TemplateSystem();
  await TemplateBootstrap.initialize(templateSystem);

  const store = new WorkspaceStore(cwd);
  const sessionStore = new InterviewSessionStore(cwd);
  await sessionStore.init();

  const interviewLoader = new InterviewLoader(templateSystem);

  // 3. Lazy LLM initialization
  let llmInstance: LLMWrapper | undefined;

  const getLLM = (): LLMWrapper => {
    if (!llmInstance) {
      const llmConfig = resolveLLMConfig();
      llmInstance = new LLMWrapper(llmConfig);
    }
    return llmInstance;
  };

  return {
    templateSystem,
    store,
    sessionStore,
    interviewLoader,
    cwd,
    getLLM,
  };
}
