import { LLMWrapper } from '../utils/llm-wrapper.js';
import { FrameworkInfo } from './framework-detector.js';
import { ScanResult } from './repository-scanner.js';
import { SavedAnalysis } from '../models/analysis-model.js';

export class ComprehensiveAnalyzer {
  private llm: LLMWrapper;

  constructor(llm: LLMWrapper) {
    this.llm = llm;
  }

  async detect(
    scanResult: ScanResult,
    frameworkInfo: FrameworkInfo,
    configContents: Record<string, string>,
    repoPath: string,
  ): Promise<Partial<SavedAnalysis>> {
    const prompt = `
You are an expert software architect analyzing a codebase.
Analyze the following project structure, frameworks, and configuration files to output a comprehensive analysis JSON.

Repository Path: ${repoPath}

Directories (first 50):
${scanResult.directories.slice(0, 50).join('\n')}

Languages detected:
${Array.from(scanResult.languages).join(', ')}

Frameworks & Services detected:
${frameworkInfo.frameworks.join(', ')}
${frameworkInfo.services.join(', ')}

Configuration Files Content:
${Object.entries(configContents)
  .map(([filename, content]) => `--- ${filename} ---\n${content.substring(0, 2000)}\n`)
  .join('\n')}

Output a JSON object that strictly matches this structure. Omit optional fields if they are not applicable.
- analyzed: Date string (YYYY-MM-DD)
- project: { name, type, domain, description, owner, ownerBackground }
- rendering: { strategy, details, clientEntry, serverEntry, prerenderScript, outputDir }
- techStack: { language, framework, buildTool, routing, stateManagement, styling, etc... }
- devTooling: { linting, formatting, etc... }
- routes: Array of { path, label }
- architecture: { patterns, designSystem, etc }
- directoryStructure: Object mapping directory strings to description strings
- keyComponents: Array of { name, role }
- seo: Object describing SEO integration
- externalIntegrations: Array of { service, method }
- performance: Object detailing performance strategies
- evidenceSatisfied: Array of strings (e.g., "technical_context", "architecture_context", "functional_context")
- evidenceReadiness: Object mapping document type (e.g. "TRD", "HLD") to { status, missing: [], suggestion }
`;

    const schema = {
      type: 'object',
      properties: {
        analyzed: { type: 'string' },
        project: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            type: { type: 'string' },
            domain: { type: 'string' },
            description: { type: 'string' },
            owner: { type: 'string' },
            ownerBackground: { type: 'string' },
          },
          required: ['name', 'type', 'description'],
        },
        rendering: { type: 'object', additionalProperties: true },
        techStack: { type: 'object', additionalProperties: true },
        devTooling: { type: 'object', additionalProperties: true },
        routes: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              path: { type: 'string' },
              label: { type: 'string' },
            },
            required: ['path', 'label'],
          },
        },
        architecture: {
          type: 'object',
          properties: {
            pattern: { type: 'string' },
            reasoning: { type: 'string' },
            confidence: { type: 'number' },
            patterns: { type: 'array', items: { type: 'string' } },
            designSystem: { type: 'object', additionalProperties: true },
          },
          additionalProperties: true,
        },
        directoryStructure: { type: 'object', additionalProperties: { type: 'string' } },
        keyComponents: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              role: { type: 'string' },
            },
            required: ['name', 'role'],
          },
        },
        seo: { type: 'object', additionalProperties: true },
        externalIntegrations: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              service: { type: 'string' },
              method: { type: 'string' },
            },
            required: ['service', 'method'],
          },
        },
        performance: { type: 'object', additionalProperties: true },
        evidenceSatisfied: { type: 'array', items: { type: 'string' } },
        evidenceReadiness: {
          type: 'object',
          additionalProperties: {
            type: 'object',
            properties: {
              status: { type: 'string' },
              missing: { type: 'array', items: { type: 'string' } },
              suggestion: { type: 'string' },
            },
            required: ['status', 'missing'],
          },
        },
      },
      required: [
        'analyzed',
        'project',
        'techStack',
        'devTooling',
        'directoryStructure',
        'evidenceSatisfied',
      ],
    };

    return await this.llm.generateStructured<Partial<SavedAnalysis>>(
      prompt,
      schema,
      'You are an expert software architect building a technical analysis document.',
    );
  }
}
