import { LLMWrapper } from '../utils/llm-wrapper.js';
import { FrameworkInfo } from './framework-detector.js';
import { ScanResult } from './repository-scanner.js';

export interface ArchitectureInfo {
  pattern: string;
  reasoning: string;
  confidence: number;
}

export class ArchitectureDetector {
  private llm: LLMWrapper;

  constructor(llm: LLMWrapper) {
    this.llm = llm;
  }

  async detect(scanResult: ScanResult, frameworkInfo: FrameworkInfo): Promise<ArchitectureInfo> {
    // 1. Initial deterministic guesses
    let basePattern = 'monolith';
    if (frameworkInfo.isMonorepo) basePattern = 'monorepo/microservices';
    if (scanResult.files.some((f) => f.includes('serverless.yml') || f.includes('lambda'))) {
      basePattern = 'serverless';
    }

    // 2. LLM Reasoning for confirmation and more detail
    const prompt = `
Analyze the following project structure and frameworks to detect the architectural pattern.
Common patterns include: monolith, microservices, event-driven, serverless, layered architecture, hexagonal architecture.

Directories: 
${scanResult.directories.slice(0, 20).join(', ')}...

Config Files:
${scanResult.configFiles.join(', ')}

Frameworks:
${frameworkInfo.frameworks.join(', ')}

Current guessing: ${basePattern}

Provide the architectural pattern, confidence level (0-1), and a brief reasoning.
`;

    // Assuming we want a structured response
    // For Phase 1, we'll parse a simple text response if LLM isn't perfectly structured
    const response = await this.llm.generate(prompt, 'You are an expert software architect.');

    // Simplistic parsing for now
    return {
      pattern: basePattern, // Fallback to base but improved by LLM
      reasoning: response,
      confidence: 0.8,
    };
  }
}
