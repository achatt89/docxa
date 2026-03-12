import { LLMWrapper } from '../utils/llm-wrapper.js';
import { TemplateSystem } from './template-system.js';
import { Document, DocumentType, DocumentSection } from '../models/document-model.js';
import { WorkspaceStore } from '../storage/workspace-store.js';
import { DocumentTemplate, TemplateSection } from './template-schema.js';
import crypto from 'crypto';

export class DocumentGenerator {
  private llm: LLMWrapper;
  private templateSystem: TemplateSystem;
  private store: WorkspaceStore;

  constructor(llm: LLMWrapper, templateSystem: TemplateSystem, store: WorkspaceStore) {
    this.llm = llm;
    this.templateSystem = templateSystem;
    this.store = store;
  }

  async generate(type: string, context: any): Promise<Document> {
    const template = this.templateSystem.getTemplate(type);
    if (!template) throw new Error(`Template for ${type} not found`);

    // Check dependencies (soft check for now)
    /*
        for (const dep of template.dependencies) {
            // Future: check if dependency document exists in store
        }
        */

    const systemPrompt = this.buildSystemPrompt(template);
    const userPrompt = this.buildUserPrompt(template, context);

    const rawResponse = await this.llm.generate(userPrompt, systemPrompt);
    const sections = this.parseSections(rawResponse, template.sections);

    return {
      type: type.toUpperCase() as DocumentType,
      version: template.version,
      status: 'draft',
      sections,
      dependencies: template.dependencies as DocumentType[],
      metadata: {
        templateVersion: template.version,
        generatedAt: new Date().toISOString(),
      },
      lastUpdated: new Date().toISOString(),
    };
  }

  private buildSystemPrompt(template: DocumentTemplate): string {
    const hints = template.promptHints;
    const prompt = `You are a professional documentation architect. 
Your goal is to generate a ${template.name} (${template.documentId}) based on the provided project context.

SYSTEM INTENT:
${hints?.systemIntent || `Generate a high-quality ${template.name}.`}

RULES:
${hints?.rules?.map((r) => `- ${r}`).join('\n') || ''}

MUST DO:
${hints?.mustDo?.map((r) => `- ${r}`).join('\n') || ''}

MUST NOT DO:
${hints?.mustNotDo?.map((r) => `- ${r}`).join('\n') || ''}

Format your response as markdown. Use the exact section titles provided in the instructions as H2 headers (## Title).
Do not include a table of contents or introductory text. Start directly with the first section header.
`;
    return prompt;
  }

  private buildUserPrompt(template: DocumentTemplate, context: any): string {
    let prompt = `PROJECT CONTEXT:
Project Name: ${context.projectName}
${context.interviewSummaries ? `Interview Summaries: ${context.interviewSummaries}` : ''}
${context.additionalContext ? `Additional Context: ${JSON.stringify(context.additionalContext, null, 2)}` : ''}

EVIDENCE FOR GENERATION:
`;

    if (context.upstreamDocs && Object.keys(context.upstreamDocs).length > 0) {
      prompt += `UPSTREAM DOCUMENTS:\n`;
      for (const [id, content] of Object.entries(context.upstreamDocs)) {
        prompt += `--- ${id} ---\n${content}\n`;
      }
    }

    if (context.interviewSessions && context.interviewSessions.length > 0) {
      prompt += `INTERVIEW SESSIONS:\n`;
      for (const session of context.interviewSessions) {
        prompt += `Role: ${session.roleId}\nAnswers:\n`;
        for (const answer of session.answers) {
          if (answer.normalizedAnswer !== undefined) {
            prompt += `- QuestionId: ${answer.questionId}\n  Answer: ${JSON.stringify(answer.normalizedAnswer)}\n`;
          }
        }
      }
    }

    if (context.repositoryAnalysis) {
      const ra = context.repositoryAnalysis;
      prompt += `REPOSITORY ANALYSIS:\n`;
      prompt += `- Languages: ${ra.languages.join(', ')}\n`;
      prompt += `- Frameworks: ${ra.frameworks.join(', ')}\n`;
      prompt += `- Services: ${ra.services.join(', ')}\n`;
      prompt += `- Monorepo: ${ra.isMonorepo ? 'Yes' : 'No'}\n`;
      prompt += `- Architecture: ${ra.architecture.pattern}\n`;
      prompt += `- Architecture Reasoning: ${ra.architecture.reasoning}\n`;
    }

    prompt += `\nPlease generate content for the following sections:\n\n`;

    for (const section of template.sections) {
      prompt += `## ${section.title}\n`;
      prompt += `ID: ${section.id}\n`;
      prompt += `PURPOSE: ${section.purpose || section.description || ''}\n`;
      if (section.guidance?.length) {
        prompt += `GUIDANCE:\n${section.guidance.map((g: string) => `- ${g}`).join('\n')}\n`;
      }
      prompt += `\n`;
    }

    return prompt;
  }

  private parseSections(
    rawResponse: string,
    templateSections: TemplateSection[],
  ): DocumentSection[] {
    const sections: DocumentSection[] = [];
    const lines = rawResponse.split('\n');

    let currentSection: Partial<DocumentSection> | null = null;
    let currentContent: string[] = [];

    const flushSection = () => {
      if (currentSection && currentSection.title) {
        sections.push({
          id: currentSection.id || crypto.randomUUID(),
          title: currentSection.title,
          content: currentContent.join('\n').trim(),
          provenance: {
            source: 'generated',
            timestamp: new Date().toISOString(),
            reasoning: 'Generated from template and LLM prompt.',
          },
        });
      }
    };

    for (const line of lines) {
      if (line.startsWith('## ')) {
        flushSection();
        const title = line.replace('## ', '').trim();
        const templateMatch = templateSections.find(
          (s) => s.title.toLowerCase() === title.toLowerCase(),
        );

        currentSection = {
          id: templateMatch?.id || crypto.randomUUID(),
          title: templateMatch?.title || title,
        };
        currentContent = [];
      } else if (currentSection) {
        // Skip metadata lines often generated by LLM if they repeat the prompt structure
        if (
          !line.startsWith('ID: ') &&
          !line.startsWith('PURPOSE: ') &&
          !line.startsWith('GUIDANCE:')
        ) {
          currentContent.push(line);
        }
      }
    }
    flushSection();

    // If no sections were parsed, fallback to a single block (very unlikely if LLM followed instructions)
    if (sections.length === 0) {
      sections.push({
        id: crypto.randomUUID(),
        title: 'Document Content',
        content: rawResponse,
        provenance: {
          source: 'generated',
          timestamp: new Date().toISOString(),
          reasoning: 'Parsing failed, returning raw response.',
        },
      });
    }

    return sections;
  }
}
