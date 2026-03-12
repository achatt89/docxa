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
import { deriveAnalysisEvidence } from '../../generation/analysis-evidence.js';
import { initializeRuntime, DocxaRuntime } from '../../runtime/initialize-runtime.js';
import path from 'path';
import fs from 'fs/promises';
import * as readline from 'readline/promises';
import { stdin as input, stdout as output } from 'process';

const program = new Command();

program
  .name('docxa')
  .description('AI-powered documentation intelligence system')
  .version('0.1.0')
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
 * Helper to get the canonical interview directory.
 */
async function getInterviewDir(cwd: string): Promise<string> {
  const interviewDir = path.join(cwd, 'templates', 'interviews');
  const legacyInterviewDir = path.join(cwd, 'interviews');

  try {
    const officialEntries = await fs.readdir(interviewDir);
    if (officialEntries.length === 0) {
      const legacyEntries = await fs.readdir(legacyInterviewDir);
      if (legacyEntries.length > 0) {
        console.warn(
          `⚠️  Warning: Using legacy interview directory: ${legacyInterviewDir}. Please move interview definitions to templates/interviews/`,
        );
        return legacyInterviewDir;
      }
    }
  } catch {
    try {
      const legacyEntries = await fs.readdir(legacyInterviewDir);
      if (legacyEntries.length > 0) {
        console.warn(
          `⚠️  Warning: Using legacy interview directory: ${legacyInterviewDir}. Please move interview definitions to templates/interviews/`,
        );
        return legacyInterviewDir;
      }
    } catch {
      // Neither exists, Loader will handle it
    }
  }
  return interviewDir;
}

program
  .command('init')
  .description('Initialize a new Docxa workspace')
  .option('-m, --mode <mode>', 'Project mode (greenfield or existing)', 'greenfield')
  .action(async (options: { mode: string }) => {
    const runtime = await getRuntime();
    const config: ProjectConfig = {
      name: path.basename(runtime.cwd),
      mode: options.mode as 'greenfield' | 'existing',
      rootPath: runtime.cwd,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      analysisPath: '.docxa/analysis.json',
      documentsDir: '.docxa/documents/',
      adrDir: '.docxa/adr/',
      stakeholdersPath: '.docxa/stakeholders.json',
    };

    await runtime.store.initWorkspace(config);
    console.log('✅ Docxa workspace initialized in .docxa/');
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

    const archDetector = new ArchitectureDetector(runtime.getLLM());
    const archInfo = await archDetector.detect(result, frameworkInfo);

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
    const interviewDir = await getInterviewDir(runtime.cwd);
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
    const interviewDir = await getInterviewDir(runtime.cwd);
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
    const analysisAvailable = savedAnalysis ? deriveAnalysisEvidence(savedAnalysis) : [];

    const plan = planner.plan(
      docId,
      existingDocs,
      sessions,
      options.mode as GenerationMode,
      analysisAvailable,
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
      runtime.getLLM(),
      runtime.templateSystem,
      runtime.store,
    );

    // Gather evidence
    const upstreamDocs: Record<string, string> = {};
    for (const depId of plan.availableInputs) {
      const content = await runtime.store.loadDocument(depId);
      if (content) upstreamDocs[depId] = content;
    }

    const doc = await generator.generate(docId, {
      projectName: path.basename(runtime.cwd),
      upstreamDocs,
      interviewSessions: sessions.filter(
        (s) => s.documentId === docId || plan.availableInputs.includes(s.documentId),
      ),
      repositoryAnalysis: savedAnalysis,
    });

    await runtime.store.saveDocument(
      docId,
      doc.sections.map((s) => `## ${s.title}\n\n${s.content}`).join('\n\n'),
    );
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
  .description('Validate document consistency')
  .action(async () => {
    await getRuntime(); // Just to load env/templates
    const { ConsistencyChecker } = await import('../../generation/consistency-checker.js');
    console.log('Running consistency checks...');
    const checker = new ConsistencyChecker();
    const issues = await checker.check([]);
    if (issues.length === 0) console.log('✅ No consistency issues found.');
  });

program.parse();
