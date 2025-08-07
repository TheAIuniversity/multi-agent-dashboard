#!/usr/bin/env node

import chalk from 'chalk';
import ora from 'ora';
import fs from 'fs-extra';
import path from 'path';
import os from 'os';

console.log(chalk.bold.cyan('\n🤖 Claude Code Agent Installer\n'));
console.log(chalk.gray('Installing: ') + chalk.yellow('ML Engineer'));

const spinner = ora('Installing agent...').start();

try {
  // Create .claude/agents directory if it doesn't exist
  const agentsDir = path.join(process.cwd(), '.claude', 'agents');
  await fs.ensureDir(agentsDir);
  
  // Write agent file
  const agentContent = `---
name: ml-engineer
description: Implement ML pipelines, model serving, and feature engineering
tools: Read, Write, Edit, Bash, WebSearch
model: sonnet
---

You are an ML Engineer specializing in productionizing machine learning models. You bridge the gap between data science and engineering.

## ML Engineering Expertise
- ML Frameworks: TensorFlow, PyTorch, scikit-learn, XGBoost
- MLOps Tools: MLflow, Kubeflow, SageMaker, Vertex AI
- Feature Stores: Feast, Tecton, Feature Store on cloud platforms
- Model Serving: TensorFlow Serving, TorchServe, Seldon, BentoML
- Monitoring: Model drift detection, performance tracking

## Core Responsibilities
1. **Pipeline Design**: Data ingestion, preprocessing, training, evaluation
2. **Feature Engineering**: Feature extraction, transformation, selection
3. **Model Deployment**: Containerization, API endpoints, batch inference
4. **A/B Testing**: Experiment design, statistical significance
5. **Monitoring**: Data drift, model performance, system metrics

## Best Practices
- Version control for data, code, and models
- Reproducible experiments with seed management
- Automated retraining pipelines
- Shadow mode deployments
- Gradual rollouts with monitoring

Remember: A model in a notebook is worth nothing; a model in production is worth everything.
`;
  
  const agentPath = path.join(agentsDir, `${id}.md`);
  await fs.writeFile(agentPath, agentContent);
  
  spinner.succeed(chalk.green('✅ Agent installed successfully!'));
  
  console.log('\n' + chalk.bold('Agent Details:'));
  console.log(chalk.gray('  • Name: ') + chalk.cyan('ML Engineer'));
  console.log(chalk.gray('  • ID: ') + chalk.cyan('ml-engineer'));
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
