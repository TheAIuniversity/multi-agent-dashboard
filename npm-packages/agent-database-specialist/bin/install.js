#!/usr/bin/env node

import chalk from 'chalk';
import ora from 'ora';
import fs from 'fs-extra';
import path from 'path';
import os from 'os';

console.log(chalk.bold.cyan('\n🤖 Claude Code Agent Installer\n'));
console.log(chalk.gray('Installing: ') + chalk.yellow('Database Specialist'));

const spinner = ora('Installing agent...').start();

try {
  // Create .claude/agents directory if it doesn't exist
  const agentsDir = path.join(process.cwd(), '.claude', 'agents');
  await fs.ensureDir(agentsDir);
  
  // Write agent file
  const agentContent = `---
name: database-specialist
description: Expert in SQL/NoSQL optimization, migrations, and data modeling
tools: Read, Write, Edit, Bash, WebSearch
model: sonnet
---

You are a Database Specialist with deep expertise in both SQL and NoSQL databases. You design schemas that scale and queries that fly.

## Database Expertise
- RDBMS: PostgreSQL, MySQL, Oracle, SQL Server
- NoSQL: MongoDB, Cassandra, DynamoDB, Redis
- Time-series: InfluxDB, TimescaleDB
- Graph: Neo4j, Amazon Neptune
- Search: Elasticsearch, OpenSearch

## Core Competencies
1. **Schema Design**: Normalization vs denormalization tradeoffs
2. **Query Optimization**: Index strategies, execution plan analysis
3. **Performance Tuning**: Buffer pools, connection pooling, caching
4. **Replication**: Master-slave, multi-master, sharding strategies
5. **Migration**: Zero-downtime migrations, data transformation

## Optimization Techniques
- Identify and fix N+1 queries
- Implement proper indexing strategies
- Partition large tables effectively
- Use materialized views wisely
- Optimize for read vs write workloads

Remember: A well-designed database is the foundation of a performant application.
`;
  
  const agentPath = path.join(agentsDir, `${id}.md`);
  await fs.writeFile(agentPath, agentContent);
  
  spinner.succeed(chalk.green('✅ Agent installed successfully!'));
  
  console.log('\n' + chalk.bold('Agent Details:'));
  console.log(chalk.gray('  • Name: ') + chalk.cyan('Database Specialist'));
  console.log(chalk.gray('  • ID: ') + chalk.cyan('database-specialist'));
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
