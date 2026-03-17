#!/usr/bin/env node
import { Command } from 'commander';
import { RepositoryScanner } from '../../analysis/repository-scanner.js';
import { FrameworkDetector } from '../../analysis/framework-detector.js';
import { ArchitectureDetector } from '../../analysis/architecture-detector.js';
import { ProjectConfig } from '../../models/project-model.js';
import { AnswerNormalizer } from '../../interview/answer-normalizer.js';
import { QuestionStrategy } from '../../interview/question-strategy.js';
import { InterviewEngine } from '../../interview/interview-engine.js';
import { GenerationPlanner, GenerationMode } from '../../generation/generation-planner.js';
import { SavedAnalysis } from '../../models/analysis-model.js';
import { initializeRuntime, DocxaRuntime } from '../../runtime/initialize-runtime.js';
import { LLMConfigError, LLMRuntimeError } from '../../llm/llm-config.js';
import { EvidenceResolver } from '../../generation/evidence-resolver.js';
import { getSkillStatus, installSkill, uninstallSkill } from '../../skill/skill-installer.js';
import { generateSkillContent } from '../../skill/skill-content.js';
import { resolveInterviewTemplateDir } from '../../runtime/runtime-paths.js';
import path from 'path';
import fs from 'fs/promises';
import * as readline from 'readline/promises';
import { stdin as input, stdout as output } from 'process';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const pkg = require('../../../package.json') as { version: string };

const program = new Command();

program
  .name('docxa')
  .description('AI-powered documentation intelligence system')
  .version(pkg.version)
  .option('--env-file <path>', 'Path to custom .env file');

/**
 * Shared runtime initialization for CLI commands.
 */
async function getRuntime(): Promise<DocxaRuntime> {
  const opts = program.opts();
  return await initializeRuntime({
    cwd: process.cwd(),
    envFile: opts.envFile,
    interface: 'cli',
  });
}

/**
 * Safely fetches the LLM wrapper, gracefully exiting the process
 * with a friendly message if the user hasn't configured an API key.
 */
function getLLMSafe(runtime: DocxaRuntime) {
  try {
    return runtime.getLLM();
  } catch (err: any) {
    if (err instanceof LLMConfigError) {
      console.error(`\n❌ ${err.message}\n`);
      process.exit(1);
    }
    if (err instanceof LLMRuntimeError) {
      console.error(`\n❌ LLM Runtime Error:`);
      console.error(err.message);
      if (err.originalError) {
        console.error(`Details: ${err.originalError.message}`);
      }
      process.exit(1);
    }
    throw err;
  }
}

program
  .command('init')
  .description('Initialize a new Docxa workspace')
  .option('-m, --mode <mode>', 'Project mode (greenfield or existing)')
  .action(async (options: { mode?: string }) => {
    const runtime = await getRuntime();

    // 1. Smart Mode Detection
    let detectedMode: 'greenfield' | 'existing' = 'greenfield';
    const indicators = ['src', 'package.json', '.git', 'requirements.txt', 'go.mod'];
    for (const indicator of indicators) {
      try {
        await fs.access(path.join(runtime.cwd, indicator));
        detectedMode = 'existing';
        break;
      } catch {
        // Continue checking
      }
    }

    const finalMode = (options.mode || detectedMode) as 'greenfield' | 'existing';

    const config: ProjectConfig = {
      name: path.basename(runtime.cwd),
      version: '0.0.1',
      mode: finalMode,
      rootPath: runtime.cwd,
      root: runtime.cwd,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      analysisPath: '.docxa/analysis/repo-analysis.json',
      documentsDir: '.docxa/documents/',
      adrDir: '.docxa/adr/',
      stakeholdersPath: '.docxa/stakeholders.json',
      documents: {},
      interviews: [],
      stakeholders: [],
    };

    await runtime.store.initWorkspace(config);

    // 2. Rich Status Output
    console.log('\n=========================================');
    console.log('      DOCXA WORKSPACE INITIALIZED      ');
    console.log('=========================================\n');
    console.log(`Project: ${config.name}`);
    console.log(`Mode:    ${finalMode.toUpperCase()}${options.mode ? '' : ' (Auto-detected)'}`);
    console.log(`Path:    ${runtime.cwd}\n`);

    console.log('📂 Workspace Structure:');
    const dirs = ['analysis', 'interviews', 'evidence', 'documents', 'adr', 'metadata'];
    dirs.forEach((d) => console.log(`  [✓] .docxa/${d}/`));
    console.log('  [✓] .docxa/project.json');
    console.log('  [✓] .docxa/stakeholders.json\n');

    console.log('📊 Evidence Status:');
    if (finalMode === 'existing') {
      console.log('  [ ] technical_context  - (Run `docxa discover` to satisfy)');
      console.log('  [ ] business_intent    - (Interviews required)');
    } else {
      console.log('  [ ] product_vision     - (Interviews required)');
      console.log('  [ ] roadmap_alignment  - (Interviews required)');
    }

    console.log('\n🚀 Recommended Next Steps:');
    if (finalMode === 'existing') {
      console.log('  1. Run `docxa discover` to analyze existing codebase.');
      console.log(
        '  2. Run `docxa interview start -d PRD -r product_manager` to fill the "Intent Gap".',
      );
      console.log('  3. Run `docxa generate PRD` once evidence is satisfied.');
    } else {
      console.log(
        '  1. Run `docxa interview start -d BRD -r business_stakeholder` to define vision.',
      );
      console.log('  2. Run `docxa generate BRD`.');
    }
    console.log('\n-----------------------------------------\n');
  });

program
  .command('discover')
  .description('Discover architecture and frameworks in a repository')
  .argument('[path]', 'Path to the repository', '.')
  .action(async (repoPath: string) => {
    const runtime = await getRuntime();
    console.log(`🔍 Scanning repository at ${repoPath}...`);

    const scanner = new RepositoryScanner();
    const result = await scanner.scan(path.resolve(repoPath));

    const detector = new FrameworkDetector();
    const frameworkInfo = await detector.detect(path.resolve(repoPath), result);

    const archDetector = new ArchitectureDetector(getLLMSafe(runtime));
    const archInfo = await archDetector.detect(result, frameworkInfo);

    const configContents: Record<string, string> = {};
    for (const configFile of result.configFiles) {
      try {
        const fullPath = path.resolve(repoPath, configFile);
        const data = await fs.readFile(fullPath, 'utf-8');
        configContents[configFile] = data;
      } catch {
        // Skip unreadable files
      }
    }

    const savedAnalysis: SavedAnalysis = {
      scannedAt: new Date().toISOString(),
      repositoryPath: path.resolve(repoPath),
      languages: Array.from(result.languages),
      frameworks: frameworkInfo.frameworks,
      services: frameworkInfo.services,
      isMonorepo: frameworkInfo.isMonorepo,
      architecture: {
        pattern: archInfo.pattern,
        reasoning: archInfo.reasoning,
        confidence: archInfo.confidence,
      },
      configFiles: result.configFiles,
      configContents,
    };

    await runtime.store.saveAnalysis(savedAnalysis);

    console.log('\n--- Analysis Result ---');
    console.log(`Languages: ${Array.from(result.languages).join(', ')}`);
    console.log(`Frameworks: ${frameworkInfo.frameworks.join(', ')}`);
    console.log(`Services: ${frameworkInfo.services.join(', ')}`);
    console.log(`Monorepo: ${frameworkInfo.isMonorepo ? 'Yes' : 'No'}`);
    console.log(`Detected Pattern: ${archInfo.pattern}`);
    console.log(`Reasoning: ${archInfo.reasoning}`);
  });

const interviewCmd = program.command('interview').description('Stakeholder interview commands');

interviewCmd
  .command('start')
  .description('Start a new interview session')
  .requiredOption('-d, --document <document>', 'Document ID (brd, prd, etc.)')
  .requiredOption('-r, --role <role>', 'Stakeholder role')
  .option('-n, --name <name>', 'Stakeholder name')
  .action(async (options) => {
    const runtime = await getRuntime();
    const interviewDir = await resolveInterviewTemplateDir(runtime.cwd);
    const engine = new InterviewEngine(
      runtime.interviewLoader,
      runtime.sessionStore,
      new AnswerNormalizer(),
      new QuestionStrategy(),
      interviewDir,
    );

    const session = await engine.startInterview(options.document, options.role, options.name);
    console.log(`🎤 Starting interview for ${options.document} with ${options.role}...`);
    console.log(`Session ID: ${session.sessionId}\n`);
    await conductInterview(engine, session);
  });

interviewCmd
  .command('continue')
  .description('Continue an existing interview session')
  .argument('<sessionId>', 'Session ID')
  .action(async (sessionId) => {
    const runtime = await getRuntime();
    const interviewDir = await resolveInterviewTemplateDir(runtime.cwd);
    const engine = new InterviewEngine(
      runtime.interviewLoader,
      runtime.sessionStore,
      new AnswerNormalizer(),
      new QuestionStrategy(),
      interviewDir,
    );

    const session = await engine.resumeSession(sessionId);
    if (!session) {
      console.error('❌ Session not found');
      return;
    }
    console.log(`🎤 Resuming interview for ${session.documentId}...`);
    await conductInterview(engine, session);
  });

interviewCmd
  .command('list')
  .description('List all interview sessions')
  .action(async () => {
    const runtime = await getRuntime();
    const sessions = await runtime.sessionStore.listSessions();
    if (sessions.length === 0) {
      console.log('No interview sessions found.');
      return;
    }
    console.log('\n--- Interview Sessions ---');
    sessions.forEach((s) => {
      console.log(
        `${s.sessionId} | ${s.documentId} | ${s.roleId} | ${s.status} | ${new Date(s.updatedAt).toLocaleDateString()}`,
      );
    });
  });

async function conductInterview(engine: InterviewEngine, session: any) {
  const rl = readline.createInterface({ input, output });
  try {
    let question;
    while ((question = await engine.getNextQuestion(session))) {
      console.log(`\n[${question.id}] ${question.question}`);
      if (question.guidance) {
        console.log(`💡 Guidance: ${question.guidance.join(' ')}`);
      }
      if (question.options) {
        console.log(`Options: ${question.options.join(', ')}`);
      }

      const answer = await rl.question('> ');
      if (answer.toLowerCase() === 'quit' || answer.toLowerCase() === 'exit') {
        console.log('Saving progress and exiting...');
        break;
      }

      session = await engine.registerAnswer(session, question.id, answer);
    }

    if (session.status === 'completed') {
      console.log('\n✅ Interview completed! Answers have been normalized and stored.');
    }
  } finally {
    rl.close();
  }
}

program
  .command('generate')
  .description('Generate documentation')
  .argument('<document>', 'Document type (prd, brd, hld, etc.)')
  .option('--plan', 'Show readiness report only')
  .option('--mode <mode>', 'Generation mode (strict, flexible, assisted)', 'flexible')
  .action(async (docType: string, options) => {
    const runtime = await getRuntime();
    const { DocumentGenerator } = await import('../../generation/document-generator.js');
    const planner = new GenerationPlanner();
    const docId = docType.toUpperCase();

    const existingDocs = await runtime.store.listDocuments();
    const sessions = await runtime.sessionStore.listSessions();
    const savedAnalysis = await runtime.store.loadAnalysis();
    const resolver = new EvidenceResolver();
    const evidence = resolver.resolve(savedAnalysis, sessions, existingDocs);

    const plan = planner.plan(
      docId,
      existingDocs,
      sessions,
      options.mode as GenerationMode,
      evidence.technicalContext,
    );

    if (options.plan || plan.status === 'blocked') {
      console.log('\n--- Readiness Report ---');
      console.log(`Document: ${docId}`);
      console.log(`Status: ${plan.status.toUpperCase()}`);
      console.log(`Confidence: ${plan.confidence.toUpperCase()}`);
      console.log(`Hard Dep Satisfied: ${plan.hardDependenciesSatisfied ? 'YES' : 'NO'}`);
      if (plan.missingRequiredEvidence.length > 0)
        console.log(`Missing Required Evidence: ${plan.missingRequiredEvidence.join(', ')}`);
      if (plan.missingOptionalEvidence.length > 0)
        console.log(`Missing Optional Evidence: ${plan.missingOptionalEvidence.join(', ')}`);
      if (plan.alternativeEvidenceUsed.length > 0)
        console.log(`Alternative Evidence: ${plan.alternativeEvidenceUsed.join(', ')}`);
      if (plan.warnings.length > 0) {
        console.log('\nWarnings:');
        plan.warnings.forEach((w) => console.log(`- ${w}`));
      }

      if (plan.suggestions.length > 0) {
        console.log('\nSuggestions:');
        plan.suggestions.forEach((s) => console.log(`- ${s}`));
      }

      if (plan.status === 'blocked') {
        console.log('\n❌ Generation blocked. Satisfy evidence requirements or use flexible mode.');
        return;
      }
      if (options.plan) return;
    }

    console.log(`📄 Generating ${docId}...`);

    const generator = new DocumentGenerator(
      getLLMSafe(runtime),
      runtime.templateSystem,
      runtime.store,
    );

    // Gather evidence
    const upstreamDocs: Record<string, string> = {};
    for (const depId of plan.availableInputs) {
      const content = await runtime.store.loadDocument(depId);
      if (content) upstreamDocs[depId] = content;
    }

    process.stdout.write(`📄 Generating ${docId}... `);
    const generationInterval = setInterval(() => {
      process.stdout.write('.');
    }, 2000);

    const doc = await generator.generate(docId, {
      projectName: path.basename(runtime.cwd),
      upstreamDocs,
      interviewSessions: sessions.filter(
        (s) => s.documentId === docId || plan.availableInputs.includes(s.documentId),
      ),
      repositoryAnalysis: savedAnalysis,
    });

    clearInterval(generationInterval);
    process.stdout.write(' Done!\n');

    const relativeDocPath = path.join('documents', `${docId.toLowerCase()}.md`);
    await runtime.store.saveDocument(
      docId,
      doc.sections.map((s) => `## ${s.title}\n\n${s.content}`).join('\n\n'),
    );

    // Update project metadata
    await runtime.store.updateDocumentMetadata(docId, {
      path: relativeDocPath,
      generated: new Date().toISOString().split('T')[0],
      status: 'draft',
    });

    console.log(`✅ Generated ${docId} version ${doc.version}`);
  });

program
  .command('list-documents')
  .description('List available documents')
  .action(async () => {
    const runtime = await getRuntime();
    const docs = await runtime.store.listDocuments();
    if (docs.length === 0) {
      console.log('No documents found in workspace.');
      return;
    }
    console.log('--- Workspace Documents ---');
    docs.forEach((d) => console.log(`- ${d}`));
  });

program
  .command('validate')
  .description('Validate workspace and document consistency')
  .action(async () => {
    const runtime = await getRuntime();
    const { ConsistencyChecker } = await import('../../generation/consistency-checker.js');
    console.log('🔍 Running workspace validation...');
    const checker = new ConsistencyChecker();

    // 1. Check workspace integrity
    const workspaceIssues = await checker.checkWorkspace(runtime.cwd);

    // 2. Check document consistency
    const docs = await runtime.store.listDocuments();
    const documentObjects = [];
    for (const docId of docs) {
      const content = await runtime.store.loadDocument(docId);
      if (content) {
        // Mocking a minimal Document object for the checker
        documentObjects.push({
          type: docId as any,
          sections: [{ title: 'Content', content }],
        } as any);
      }
    }
    const consistencyIssues = await checker.check(documentObjects);

    const allIssues = [...workspaceIssues, ...consistencyIssues];

    if (allIssues.length === 0) {
      console.log('✅ Workspace and documents are consistent.');
    } else {
      console.log(`\nFound ${allIssues.length} issues:`);
      allIssues.forEach((issue) => {
        const icon = issue.type === 'error' ? '❌' : '⚠️';
        console.log(`${icon} [${issue.source}] ${issue.message}`);
      });
      if (allIssues.some((i) => i.type === 'error')) {
        process.exit(1);
      }
    }
  });

const skillCmd = program.command('skill').description('Manage the Docxa Claude Code skill');

skillCmd
  .command('install')
  .description('Install the Docxa skill into Claude Code (~/.claude/skills/docxa/)')
  .action(async () => {
    const content = generateSkillContent(pkg.version);
    const skillPath = await installSkill(content);
    console.log(`✅ Docxa skill installed at: ${skillPath}`);
    console.log('   Reload Claude Code and invoke with /docxa');
  });

skillCmd
  .command('uninstall')
  .description('Remove the Docxa skill from Claude Code')
  .action(async () => {
    const { installed, skillPath } = await getSkillStatus();
    if (!installed) {
      console.log('ℹ️  Docxa skill is not installed.');
      return;
    }
    const removed = await uninstallSkill();
    if (removed) {
      console.log(`✅ Docxa skill removed from: ${skillPath}`);
    } else {
      console.error('❌ Failed to remove skill. Check permissions and try again.');
    }
  });

skillCmd
  .command('status')
  .description('Show whether the Docxa skill is installed')
  .action(async () => {
    const { installed, skillPath, claudeDir } = await getSkillStatus();
    console.log(`Claude skills directory: ${claudeDir}`);
    console.log(`Skill path:              ${skillPath}`);
    console.log(`Status:                  ${installed ? '✅ Installed' : '❌ Not installed'}`);
    if (!installed) {
      console.log('\nRun `docxa skill install` to install it.');
    }
  });

program.parse();
