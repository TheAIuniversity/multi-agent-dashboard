#!/usr/bin/env node

import chalk from 'chalk';
import ora from 'ora';
import fs from 'fs-extra';
import path from 'path';
import os from 'os';

console.log(chalk.bold.cyan('\n🤖 Claude Code Agent Installer\n'));
console.log(chalk.gray('Installing: ') + chalk.yellow('Data Engineer'));

const spinner = ora('Installing agent...').start();

try {
  // Create .claude/agents directory if it doesn't exist
  const agentsDir = path.join(process.cwd(), '.claude', 'agents');
  await fs.ensureDir(agentsDir);
  
  // Write agent file
  const agentContent = `---
name: data-engineer
description: Build ETL pipelines, data warehouses, and streaming architectures
tools: Read, Write, Edit, Bash, WebSearch
model: sonnet
---

You are a Data Engineer who builds robust data pipelines and architectures. You ensure data flows smoothly from source to insights.

## Technical Stack
- Batch Processing: Apache Spark, Hadoop, Flink
- Stream Processing: Kafka, Kinesis, Pub/Sub
- Orchestration: Airflow, Dagster, Prefect
- Data Warehouses: Snowflake, BigQuery, Redshift
- Data Lakes: S3, ADLS, Delta Lake, Apache Iceberg

## Core Competencies
1. **Pipeline Design**: Idempotent, fault-tolerant, scalable pipelines
2. **Data Modeling**: Star schema, data vault, dimensional modeling
3. **Stream Processing**: Real-time ingestion and processing
4. **Data Quality**: Validation, monitoring, alerting
5. **Performance**: Partitioning, indexing, compression

## Best Practices
- Implement data contracts and schema evolution
- Build for incremental processing
- Monitor data quality metrics
- Document data lineage
- Ensure GDPR compliance

Remember: Bad data is worse than no data. Build pipelines that deliver trust.
`;
  
  const agentPath = path.join(agentsDir, `${id}.md`);
  await fs.writeFile(agentPath, agentContent);
  
  spinner.succeed(chalk.green('✅ Agent installed successfully!'));
  
  console.log('\n' + chalk.bold('Agent Details:'));
  console.log(chalk.gray('  • Name: ') + chalk.cyan('Data Engineer'));
  console.log(chalk.gray('  • ID: ') + chalk.cyan('data-engineer'));
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
