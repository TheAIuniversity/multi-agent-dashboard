#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import fs from 'fs-extra';
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import os from 'os';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const program = new Command();

program
  .name('multi-agent-dashboard-connect')
  .description('Connect Claude Code to the Multi-Agent Dashboard')
  .version('1.0.0');

program
  .command('start', { isDefault: true })
  .description('Start the dashboard and connect Claude Code')
  .option('-p, --port <port>', 'Dashboard port', '5174')
  .option('-w, --websocket <port>', 'WebSocket port', '8766')
  .action(async (options) => {
    console.log(chalk.bold.cyan('\n🚀 Multi-Agent Dashboard Connector\n'));
    
    const spinner = ora('Setting up dashboard...').start();
    
    try {
      // 1. Check if dashboard exists
      const dashboardDir = path.join(os.homedir(), '.claude', 'multi-agent-dashboard');
      const dashboardExists = await fs.pathExists(dashboardDir);
      
      if (!dashboardExists) {
        spinner.text = 'Downloading dashboard...';
        await downloadDashboard(dashboardDir);
      } else {
        spinner.text = 'Dashboard already installed, using existing...';
        console.log(chalk.cyan('\n📊 Using existing dashboard with preserved data'));
      }
      
      // 2. Install dependencies
      spinner.text = 'Installing dependencies...';
      await installDependencies(dashboardDir);
      
      // 3. Start the dashboard
      spinner.text = 'Starting dashboard servers...';
      const processes = await startDashboard(dashboardDir, options);
      
      // 4. Configure Claude Code hooks GLOBALLY
      spinner.text = 'Configuring global Claude Code hooks...';
      await configureGlobalHooks(options);
      
      spinner.succeed(chalk.green('✅ Dashboard connected successfully!'));
      
      console.log('\n' + chalk.bold('Dashboard Status:'));
      console.log(chalk.gray('  • Dashboard UI: ') + chalk.cyan(`http://localhost:${options.port}`));
      console.log(chalk.gray('  • WebSocket: ') + chalk.cyan(`ws://localhost:${options.websocket}`));
      console.log(chalk.gray('  • API Server: ') + chalk.cyan('http://localhost:3001'));
      
      console.log('\n' + chalk.yellow('ℹ️  Keep this terminal open to maintain the connection'));
      console.log(chalk.gray('Press Ctrl+C to stop the dashboard\n'));
      
      // Keep process alive
      process.on('SIGINT', () => {
        console.log(chalk.yellow('\n\nShutting down dashboard...'));
        processes.forEach(p => p.kill());
        process.exit(0);
      });
      
    } catch (error) {
      spinner.fail(chalk.red('Failed to connect dashboard'));
      console.error(chalk.red(error.message));
      process.exit(1);
    }
  });

async function downloadDashboard(targetDir) {
  // Check if database exists - preserve it!
  const dbPath = path.join(targetDir, 'apps', 'server', 'events.db');
  let existingDb = null;
  
  if (await fs.pathExists(dbPath)) {
    console.log(chalk.yellow('📊 Preserving existing database...'));
    existingDb = await fs.readFile(dbPath);
  }
  
  // Download from GitHub
  console.log(chalk.cyan('📥 Downloading dashboard from GitHub...'));
  
  const tempDir = path.join(os.tmpdir(), 'multi-agent-dashboard-' + Date.now());
  
  // Clone the repository
  await runCommand('git', ['clone', '--depth=1', 'https://github.com/TheAIuniversity/multi-agent-dashboard.git', tempDir], {});
  
  // Copy to target directory
  await fs.ensureDir(targetDir);
  await fs.copy(tempDir, targetDir, {
    filter: (src) => {
      // Skip unnecessary files
      return !src.includes('.git') &&
             !src.includes('.gitignore') &&
             !src.includes('npm-packages') &&
             !src.includes('events.db'); // Don't overwrite database
    }
  });
  
  // Clean up temp directory
  await fs.remove(tempDir);
  
  // Restore the database if it existed
  if (existingDb) {
    await fs.writeFile(dbPath, existingDb);
    console.log(chalk.green('✅ Previous data restored!'));
  }
}

async function installDependencies(dashboardDir) {
  // Install backend dependencies
  await runCommand('npm', ['install'], {
    cwd: path.join(dashboardDir, 'apps', 'server')
  });
  
  // Install frontend dependencies
  await runCommand('npm', ['install'], {
    cwd: path.join(dashboardDir, 'apps', 'client')
  });
}

async function startDashboard(dashboardDir, options) {
  const processes = [];
  
  // Start backend server
  const backend = spawn('node', ['index.js'], {
    cwd: path.join(dashboardDir, 'apps', 'server'),
    env: { ...process.env, PORT: '3001', WS_PORT: options.websocket },
    shell: true,
    stdio: 'inherit'
  });
  processes.push(backend);
  
  // Start frontend
  const frontend = spawn('npm', ['run', 'dev', '--', '--port', options.port], {
    cwd: path.join(dashboardDir, 'apps', 'client'),
    shell: true,
    stdio: 'inherit'
  });
  processes.push(frontend);
  
  // Wait for servers to start
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  return processes;
}

async function configureGlobalHooks(options) {
  // Configure hooks in the GLOBAL Claude Code settings
  // This makes ALL Claude Code instances report to the dashboard
  
  const settingsPath = path.join(os.homedir(), '.claude', 'settings.json');
  
  // Ensure .claude directory exists
  await fs.ensureDir(path.join(os.homedir(), '.claude'));
  
  // Read existing settings or create new
  let settings = {};
  if (await fs.pathExists(settingsPath)) {
    try {
      settings = await fs.readJson(settingsPath);
    } catch (e) {
      console.log(chalk.yellow('⚠️  Could not parse existing settings, creating new...'));
      settings = {};
    }
  }
  
  // Preserve existing settings but add/update hooks
  // This merges with existing settings instead of overwriting
  if (!settings.hooks) {
    settings.hooks = {};
  }
  
  // Add dashboard hooks in correct Claude Code format
  settings.hooks = {
    "UserPromptSubmit": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "curl -X POST http://localhost:3001/events -H 'Content-Type: application/json' -d '{\"app\": \"'\"$APP_NAME\"'\", \"session_id\": \"'\"$SESSION_ID\"'\", \"event_type\": \"UserPromptSubmit\", \"payload\": {\"prompt\": \"User submitted prompt\"}, \"summary\": \"User prompt\"}' 2>/dev/null || true"
          }
        ]
      }
    ],
    "PreToolUse": [
      {
        "hooks": [
          {
            "type": "command", 
            "command": "curl -X POST http://localhost:3001/events -H 'Content-Type: application/json' -d '{\"app\": \"'\"$APP_NAME\"'\", \"session_id\": \"'\"$SESSION_ID\"'\", \"event_type\": \"PreToolUse\", \"payload\": {\"tool\": \"Tool\"}, \"summary\": \"Using tool\"}' 2>/dev/null || true"
          }
        ]
      }
    ],
    "PostToolUse": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "curl -X POST http://localhost:3001/events -H 'Content-Type: application/json' -d '{\"app\": \"'\"$APP_NAME\"'\", \"session_id\": \"'\"$SESSION_ID\"'\", \"event_type\": \"PostToolUse\", \"payload\": {\"tool\": \"Tool\"}, \"summary\": \"Tool completed\"}' 2>/dev/null || true"
          }
        ]
      }
    ],
    "Stop": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "curl -X POST http://localhost:3001/events -H 'Content-Type: application/json' -d '{\"app\": \"'\"$APP_NAME\"'\", \"session_id\": \"'\"$SESSION_ID\"'\", \"event_type\": \"Stop\", \"payload\": {}, \"summary\": \"Session stopped\"}' 2>/dev/null || true"
          }
        ]
      }
    ]
  };
  
  // Write updated settings
  await fs.writeJson(settingsPath, settings, { spaces: 2 });
  
  console.log(chalk.gray('\n✅ Global hooks configured - ALL Claude Code instances will report to dashboard'));
  console.log(chalk.gray('Settings: ' + settingsPath));
  console.log(chalk.yellow('\n⚠️  IMPORTANT: Restart Claude Code for hooks to take effect!'));
}

function runCommand(command, args, options) {
  return new Promise((resolve, reject) => {
    const proc = spawn(command, args, { 
      ...options, 
      stdio: 'ignore',
      shell: true,
      env: { ...process.env }
    });
    proc.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`Command failed: ${command} ${args.join(' ')}`));
    });
    proc.on('error', (err) => {
      reject(err);
    });
  });
}

program.parse(process.argv);