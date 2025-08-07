#!/usr/bin/env node

import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Import the agent library data
const agentLibraryPath = path.join(__dirname, '../apps/client/src/agentLibraryData.js');
const agentLibraryContent = await fs.readFile(agentLibraryPath, 'utf8');

// Extract agents from the file (simple parsing)
const agentsMatch = agentLibraryContent.match(/export const agentLibrary = \[([\s\S]*?)\];/);
if (!agentsMatch) {
  console.error('Could not find agentLibrary in file');
  process.exit(1);
}

// Parse the agents (this is a simplified parser - in production use proper AST parsing)
const agentsString = agentsMatch[1];
const agentMatches = [...agentsString.matchAll(/\{\s*id:\s*'([^']+)'[\s\S]*?name:\s*'([^']+)'[\s\S]*?description:\s*'([^']+)'[\s\S]*?prompt:\s*`([^`]+)`/g)];

console.log(`Found ${agentMatches.length} agents to package\n`);

// Generate package for each agent
for (const match of agentMatches) {
  const [_, id, name, description, prompt] = match;
  
  console.log(`Creating package for: ${id}`);
  
  const packageDir = path.join(__dirname, `@claude-code/agent-${id}`);
  await fs.ensureDir(packageDir);
  await fs.ensureDir(path.join(packageDir, 'bin'));
  
  // Create package.json
  const packageJson = {
    name: `@claude-code/agent-${id}`,
    version: "1.0.0",
    description: description,
    main: "index.js",
    bin: {
      [`agent-${id}`]: "./bin/install.js"
    },
    scripts: {
      test: "node test.js"
    },
    keywords: [
      "claude",
      "claude-code",
      "ai",
      "agent",
      id.split('-').join(' '),
      "multi-agent"
    ],
    author: "Claude Code Team",
    license: "MIT",
    dependencies: {
      "chalk": "^5.3.0",
      "fs-extra": "^11.1.1",
      "ora": "^7.0.1"
    },
    engines: {
      "node": ">=14.0.0"
    },
    repository: {
      "type": "git",
      "url": "https://github.com/claude-code/agents.git"
    }
  };
  
  await fs.writeJson(path.join(packageDir, 'package.json'), packageJson, { spaces: 2 });
  
  // Create install script
  const installScript = `#!/usr/bin/env node

import chalk from 'chalk';
import ora from 'ora';
import fs from 'fs-extra';
import path from 'path';
import os from 'os';

console.log(chalk.bold.cyan('\\n🤖 Claude Code Agent Installer\\n'));
console.log(chalk.gray('Installing: ') + chalk.yellow('${name}'));

const spinner = ora('Installing agent...').start();

try {
  // Create .claude/agents directory if it doesn't exist
  const agentsDir = path.join(process.cwd(), '.claude', 'agents');
  await fs.ensureDir(agentsDir);
  
  // Write agent file
  const agentContent = \`---
name: ${id}
description: ${description.replace(/'/g, "\\'")}
tools: Read, Write, Edit, Bash, WebSearch
model: sonnet
---

${prompt.replace(/`/g, '\\`')}
\`;
  
  const agentPath = path.join(agentsDir, \`\${id}.md\`);
  await fs.writeFile(agentPath, agentContent);
  
  spinner.succeed(chalk.green('✅ Agent installed successfully!'));
  
  console.log('\\n' + chalk.bold('Agent Details:'));
  console.log(chalk.gray('  • Name: ') + chalk.cyan('${name}'));
  console.log(chalk.gray('  • ID: ') + chalk.cyan('${id}'));
  console.log(chalk.gray('  • Location: ') + chalk.cyan(agentPath));
  
  console.log('\\n' + chalk.yellow('ℹ️  The agent is now available in Claude Code'));
  console.log(chalk.gray('It will be automatically triggered when relevant tasks are detected.\\n'));
  
  // Optional: Connect to dashboard
  console.log(chalk.dim('To monitor this agent, run: npx multi-agent-dashboard-connect'));
  
} catch (error) {
  spinner.fail(chalk.red('Failed to install agent'));
  console.error(chalk.red(error.message));
  process.exit(1);
}
`;
  
  await fs.writeFile(path.join(packageDir, 'bin', 'install.js'), installScript);
  await fs.chmod(path.join(packageDir, 'bin', 'install.js'), '755');
  
  // Create README
  const readme = `# ${name}

${description}

## Installation

\`\`\`bash
npx @claude-code/agent-${id}
\`\`\`

## About

This agent specializes in ${name.toLowerCase()} tasks and will be automatically triggered by Claude Code when relevant work is detected.

## Features

- Automatic delegation from Claude Code
- Specialized expertise in ${id.split('-').join(' ')}
- Integrated with Multi-Agent Dashboard for monitoring

## Usage

Once installed, this agent will be automatically used by Claude Code when appropriate. No manual configuration required.

## Dashboard Integration

To monitor this agent's activity in real-time:

\`\`\`bash
npx multi-agent-dashboard-connect
\`\`\`

Then open http://localhost:5174 in your browser.
`;
  
  await fs.writeFile(path.join(packageDir, 'README.md'), readme);
}

console.log('\n✅ All agent packages generated successfully!');
console.log('\nNext steps:');
console.log('1. Test packages locally: npm link in each package directory');
console.log('2. Publish to npm: npm publish in each package directory');
console.log('3. Main dashboard: npm publish in multi-agent-dashboard-connect/');