import { LLMWrapper } from '../utils/llm-wrapper.js';
import { FrameworkInfo } from './framework-detector.js';
import { ScanResult } from './repository-scanner.js';
import { ComprehensiveAnalysis } from '../models/analysis-model.js';

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
  ): Promise<ComprehensiveAnalysis> {
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

    // We use generate() instead of generateStructured() since complex nested schemas
    // without perfectly strict definitions commonly trigger HTTP 400 from strict mode APIs.
    const systemPrompt =
      'You are an expert software architect building a technical analysis document. You must return only valid JSON matching the requested structure.';

    // Explicitly add JSON instruction to user prompt
    const enhancedPrompt =
      prompt + '\n\nIMPORTANT: You must return the analysis strictly as a valid JSON object.';

    const responseText = await this.llm.generate(enhancedPrompt, systemPrompt);

    try {
      // Find the JSON block if wrapped in markdown
      const match = responseText.match(/```json\n([\s\S]*)\n```/);
      const jsonString = match ? match[1] : responseText;
      return JSON.parse(jsonString) as ComprehensiveAnalysis;
    } catch (e: any) {
      throw new Error(
        `Failed to parse LLM JSON output: ${e.message}\nOutput was: ${responseText.substring(0, 100)}...`,
        { cause: e },
      );
    }
  }
}
