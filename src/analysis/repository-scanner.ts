import fs from 'fs/promises';
import path from 'path';

export interface ScanResult {
  files: string[];
  directories: string[];
  configFiles: string[];
  languages: Set<string>;
}

export class RepositoryScanner {
  private ignoreDirs = new Set([
    'node_modules',
    '.git',
    'dist',
    'build',
    '.docxa',
    'venv',
    '.next',
  ]);
  private configPatterns = [
    'package.json',
    'pyproject.toml',
    'requirements.txt',
    'pom.xml',
    'go.mod',
    'docker-compose.yml',
    'angular.json',
    'angular.json',
    'tsconfig.json',
  ];

  async scan(rootPath: string): Promise<ScanResult> {
    const result: ScanResult = {
      files: [],
      directories: [],
      configFiles: [],
      languages: new Set(),
    };

    await this.walk(rootPath, rootPath, result);
    return result;
  }

  private async walk(currentPath: string, rootPath: string, result: ScanResult): Promise<void> {
    const entries = await fs.readdir(currentPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(currentPath, entry.name);
      const relativePath = path.relative(rootPath, fullPath);

      if (entry.isDirectory()) {
        if (this.ignoreDirs.has(entry.name)) continue;
        result.directories.push(relativePath);
        await this.walk(fullPath, rootPath, result);
      } else {
        result.files.push(relativePath);

        if (this.configPatterns.includes(entry.name)) {
          result.configFiles.push(relativePath);
        }

        const ext = path.extname(entry.name);
        if (ext) {
          result.languages.add(ext.slice(1));
        }
      }
    }
  }
}
