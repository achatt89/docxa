import fs from 'fs/promises';
import path from 'path';
import { DocumentTemplate, DocumentTemplateSchema } from './template-schema.js';

export class TemplateLoader {
  async loadTemplates(templateDir: string): Promise<DocumentTemplate[]> {
    const templates: DocumentTemplate[] = [];
    await this.recursiveLoad(templateDir, templates);
    return templates;
  }

  private async recursiveLoad(currentPath: string, templates: DocumentTemplate[]): Promise<void> {
    try {
      const entries = await fs.readdir(currentPath, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(currentPath, entry.name);

        if (entry.isDirectory()) {
          await this.recursiveLoad(fullPath, templates);
        } else if (entry.isFile() && entry.name.endsWith('.json')) {
          try {
            const content = await fs.readFile(fullPath, 'utf-8');
            const json = JSON.parse(content);
            const validated = DocumentTemplateSchema.parse(json);
            templates.push(validated);
          } catch (error: any) {
            console.error(`Failed to load template at ${fullPath}: ${error.message}`);
            // In recruitment of "fail loudly", we rethrow or handle specifically
            throw new Error(`Template validation failed for ${fullPath}: ${error.message}`, {
              cause: error,
            });
          }
        }
      }
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        console.warn(`Template directory not found: ${currentPath}`);
        return;
      }
      throw error;
    }
  }

  async loadTemplateById(
    templateDir: string,
    documentId: string,
  ): Promise<DocumentTemplate | undefined> {
    const all = await this.loadTemplates(templateDir);
    return all.find((t) => t.documentId === documentId);
  }
}
