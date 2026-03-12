import fs from 'fs/promises';
import path from 'path';
import { ScanResult } from './repository-scanner.js';

export interface FrameworkInfo {
  languages: string[];
  frameworks: string[];
  services: string[];
  isMonorepo: boolean;
}

export class FrameworkDetector {
  async detect(rootPath: string, scanResult: ScanResult): Promise<FrameworkInfo> {
    const info: FrameworkInfo = {
      languages: Array.from(scanResult.languages),
      frameworks: [],
      services: [],
      isMonorepo: false,
    };

    for (const configFile of scanResult.configFiles) {
      const fileName = path.basename(configFile);
      const fullPath = path.join(rootPath, configFile);

      switch (fileName) {
        case 'package.json':
          await this.detectNodeFrameworks(fullPath, info);
          break;
        case 'pyproject.toml':
        case 'requirements.txt':
          info.frameworks.push('Python/Pip');
          break;
        case 'docker-compose.yml':
          info.services.push('Docker Compose');
          break;
        case 'angular.json':
          info.frameworks.push('Angular');
          break;
      }
    }

    // Monorepo detection
    if (scanResult.directories.includes('packages') || scanResult.directories.includes('apps')) {
      info.isMonorepo = true;
    }

    return info;
  }

  private async detectNodeFrameworks(filePath: string, info: FrameworkInfo): Promise<void> {
    try {
      const data = await fs.readFile(filePath, 'utf-8');
      const pkg = JSON.parse(data);
      const deps = { ...pkg.dependencies, ...pkg.devDependencies };

      if (deps['next']) info.frameworks.push('Next.js');
      if (deps['express']) info.frameworks.push('Express');
      if (deps['react']) info.frameworks.push('React');
      if (deps['vue']) info.frameworks.push('Vue');
      if (deps['@nestjs/core']) info.frameworks.push('NestJS');
      if (pkg.workspaces) info.isMonorepo = true;
    } catch {
      // Ignore parsing errors
    }
  }
}
