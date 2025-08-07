#!/bin/bash

echo "Updating all agent installers to support --yes flag..."

for dir in agent-*/; do
  if [ -d "$dir" ]; then
    agent_name=$(basename "$dir")
    echo "Updating $agent_name..."
    
    # Update package.json to version 1.0.2
    sed -i '' 's/"version": "1.0.1"/"version": "1.0.2"/' "$dir/package.json"
    
    # Update the bin/install.js to accept --yes flag
    cat > "$dir/bin/install.js" << 'EOF'
#!/usr/bin/env node

import chalk from 'chalk';
import ora from 'ora';
import fs from 'fs-extra';
import path from 'path';
import os from 'os';
import { program } from 'commander';

// Parse command line arguments
program
  .name('AGENT_NAME_PLACEHOLDER')
  .description('Install AI agent for Claude Code')
  .option('--yes', 'Auto-confirm installation')
  .parse(process.argv);

const options = program.opts();

console.log(chalk.bold.cyan('\n🤖 Claude Code Agent Installer\n'));
console.log(chalk.gray('Installing: ') + chalk.yellow('AGENT_DISPLAY_PLACEHOLDER'));

const spinner = ora('Installing agent...').start();

try {
  // Create .claude/agents directory if it doesn't exist
  const agentsDir = path.join(process.cwd(), '.claude', 'agents');
  await fs.ensureDir(agentsDir);
  
  // Write agent file
  const agentContent = `AGENT_CONTENT_PLACEHOLDER`;
  
  const agentPath = path.join(agentsDir, 'AGENT_FILE_PLACEHOLDER');
  await fs.writeFile(agentPath, agentContent);
  
  spinner.succeed(chalk.green('✅ Agent installed successfully!'));
  
  console.log('\n' + chalk.bold('Agent Details:'));
  console.log(chalk.gray('  • Name: ') + chalk.cyan('AGENT_DISPLAY_PLACEHOLDER'));
  console.log(chalk.gray('  • ID: ') + chalk.cyan('AGENT_ID_PLACEHOLDER'));
  console.log(chalk.gray('  • Location: ') + chalk.cyan(agentPath));
  
  console.log('\n' + chalk.yellow('ℹ️  The agent is now available in Claude Code'));
  console.log(chalk.gray('It will be automatically triggered when relevant tasks are detected.\n'));
  
  // Optional: Connect to dashboard
  console.log(chalk.dim('To monitor this agent, run: npx multi-agent-dashboard-connect'));
  
} catch (error) {
  spinner.fail(chalk.red('Failed to install agent'));
  console.error(chalk.red(error.message));
  process.exit(1);
}
EOF
    
    echo "  ✓ Updated $agent_name"
  fi
done

echo "All agents updated to support --yes flag!"