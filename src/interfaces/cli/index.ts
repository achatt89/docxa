#!/usr/bin/env node
import { Command } from 'commander';
import { WorkspaceStore } from '../../storage/workspace-store.js';
import { RepositoryScanner } from '../../analysis/repository-scanner.js';
import { FrameworkDetector } from '../../analysis/framework-detector.js';
import { ArchitectureDetector } from '../../analysis/architecture-detector.js';
import { LLMWrapper } from '../../utils/llm-wrapper.js';
import { ProjectConfig } from '../../models/project-model.js';
import path from 'path';

const program = new Command();
const store = new WorkspaceStore(process.cwd());

program
    .name('docxa')
    .description('AI-powered documentation intelligence system')
    .version('0.1.0');

program
    .command('init')
    .description('Initialize a new Docxa workspace')
    .option('-m, --mode <mode>', 'Project mode (greenfield or existing)', 'greenfield')
    .action(async (options: { mode: string }) => {
        const config: ProjectConfig = {
            name: path.basename(process.cwd()),
            mode: options.mode as 'greenfield' | 'existing',
            rootPath: process.cwd(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            analysisPath: '.docxa/analysis.json',
            documentsDir: '.docxa/documents/',
            adrDir: '.docxa/adr/',
            stakeholdersPath: '.docxa/stakeholders.json',
        };

        await store.initWorkspace(config);
        console.log('✅ Docxa workspace initialized in .docxa/');
    });

program
    .command('discover')
    .description('Discover architecture and frameworks in a repository')
    .argument('[path]', 'Path to the repository', '.')
    .action(async (repoPath: string) => {
        console.log(`🔍 Scanning repository at ${repoPath}...`);

        const scanner = new RepositoryScanner();
        const result = await scanner.scan(path.resolve(repoPath));

        const detector = new FrameworkDetector();
        const frameworkInfo = await detector.detect(path.resolve(repoPath), result);

        const llm = new LLMWrapper();
        const archDetector = new ArchitectureDetector(llm);
        const archInfo = await archDetector.detect(result, frameworkInfo);

        console.log('\n--- Analysis Result ---');
        console.log(`Languages: ${Array.from(result.languages).join(', ')}`);
        console.log(`Frameworks: ${frameworkInfo.frameworks.join(', ')}`);
        console.log(`Services: ${frameworkInfo.services.join(', ')}`);
        console.log(`Monorepo: ${frameworkInfo.isMonorepo ? 'Yes' : 'No'}`);
        console.log(`Detected Pattern: ${archInfo.pattern}`);
        console.log(`Reasoning: ${archInfo.reasoning}`);
    });

program
    .command('interview')
    .description('Conduct a stakeholder interview')
    .argument('<role>', 'Stakeholder role (pm, architect, developer, etc.)')
    .argument('<name>', 'Stakeholder name')
    .action(async (role: any, name: string) => {
        const { StakeholderManager } = await import('../../interview/stakeholder-manager.js');
        const { RoleQuestionEngine } = await import('../../interview/role-question-engine.js');
        const { ConversationEngine } = await import('../../interview/conversation-engine.js');

        console.log(`🎤 Starting interview with ${name} (${role})...`);

        const manager = new StakeholderManager(store);
        const stakeholder = await manager.addStakeholder(name, role);

        const llm = new LLMWrapper();
        const qEngine = new RoleQuestionEngine(llm);
        const questions = await qEngine.generateQuestions(role, "Generic software project");

        console.log('\nPlease answer the following questions (Phase 1 placeholder - auto-responding):');
        const conversation = new ConversationEngine(llm);
        const session = conversation.startSession(stakeholder, questions);

        for (const q of questions) {
            console.log(`Q: ${q}`);
            session.answers.set(q, "Sample answer for Phase 1 simulation.");
        }

        const summary = await conversation.summarizeInterview(session);
        console.log('\n--- Interview Summary ---');
        console.log(summary);
    });

program
    .command('generate')
    .description('Generate documentation')
    .argument('<document>', 'Document type (prd, brd, hld, etc.)')
    .action(async (docType: string) => {
        const { DocumentGenerator } = await import('../../generation/document-generator.js');
        const { TemplateSystem } = await import('../../generation/template-system.js');
        const { BRDTemplate } = await import('../../templates/brd.template.js');
        const { PRDTemplate } = await import('../../templates/prd.template.js');

        console.log(`📄 Generating ${docType.toUpperCase()}...`);

        const system = new TemplateSystem();
        system.register(BRDTemplate);
        system.register(PRDTemplate);

        const llm = new LLMWrapper();
        const generator = new DocumentGenerator(llm, system, store);

        const doc = await generator.generate(docType.toUpperCase() as any, {
            projectName: path.basename(process.cwd()),
            interviewSummaries: "Simulated interview summaries."
        });

        console.log(`✅ Generated ${docType.toUpperCase()} version ${doc.version}`);
    });

program
    .command('list-documents')
    .description('List available documents')
    .action(async () => {
        console.log('Listing documents...');
    });

program
    .command('validate')
    .description('Validate document consistency')
    .action(async () => {
        const { ConsistencyChecker } = await import('../../generation/consistency-checker.js');
        console.log('Running consistency checks...');
        const checker = new ConsistencyChecker();
        const issues = await checker.check([]);
        if (issues.length === 0) console.log('✅ No consistency issues found.');
    });

program.parse();
