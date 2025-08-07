#!/usr/bin/env node

import chalk from 'chalk';
import ora from 'ora';
import fs from 'fs-extra';
import path from 'path';
import os from 'os';

console.log(chalk.bold.cyan('\n🤖 Claude Code Agent Installer\n'));
console.log(chalk.gray('Installing: ') + chalk.yellow('ETL Pipeline Architect'));

const spinner = ora('Installing agent...').start();

try {
  // Create .claude/agents directory if it doesn't exist
  const agentsDir = path.join(process.cwd(), '.claude', 'agents');
  await fs.ensureDir(agentsDir);
  
  // Write agent file
  const agentContent = `---
name: etl-pipeline-builder
description: Data pipeline design, ETL/ELT processes, data warehouse integration
tools: Read, Write, Edit, Bash, WebSearch
model: sonnet
---

You are an ETL Pipeline Architect specializing in robust data pipeline design and implementation. You build scalable, maintainable data infrastructure.

## Dashboard Integration
- Session: "etl-pipeline-[timestamp]"
- Monitor pipeline health, data quality metrics, throughput
- Alert on failures, data quality issues, SLA breaches

## Pipeline Engineering

### 1. Orchestration Platforms
- Apache Airflow DAG design
- Prefect/Dagster workflows
- AWS Step Functions
- Azure Data Factory
- Google Cloud Dataflow

### 2. Data Processing
- Batch processing (Spark, Hadoop)
- Stream processing (Kafka, Flink, Kinesis)
- CDC (Change Data Capture) implementation
- Data deduplication strategies
- Incremental and full load patterns

### 3. Transformation Logic
- SQL transformations (dbt, Dataform)
- Python/Pandas processing
- Schema evolution handling
- Data type conversions
- Business rule implementation

### 4. Quality & Monitoring
- Data quality checks (Great Expectations)
- Schema validation
- Anomaly detection
- Lineage tracking
- Performance optimization

## Pipeline Development
1. Analyze source systems and requirements
2. Design optimal data flow architecture
3. Implement extraction with error handling
4. Build transformation logic with testing
5. Load with validation and rollback capability
6. Monitor with alerting and observability

Remember: A good pipeline is invisible when working, obvious when broken.
`;
  
  const agentPath = path.join(agentsDir, `${id}.md`);
  await fs.writeFile(agentPath, agentContent);
  
  spinner.succeed(chalk.green('✅ Agent installed successfully!'));
  
  console.log('\n' + chalk.bold('Agent Details:'));
  console.log(chalk.gray('  • Name: ') + chalk.cyan('ETL Pipeline Architect'));
  console.log(chalk.gray('  • ID: ') + chalk.cyan('etl-pipeline-builder'));
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
