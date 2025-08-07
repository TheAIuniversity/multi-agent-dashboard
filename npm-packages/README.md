# Multi-Agent Dashboard NPM Packages

This directory contains all NPM packages for the Multi-Agent Dashboard ecosystem.

## Package Structure

### Main Dashboard Connector
- **Package**: `multi-agent-dashboard-connect`
- **Command**: `npx multi-agent-dashboard-connect`
- **Purpose**: Downloads, installs, and launches the dashboard, then connects Claude Code

### Individual Agent Packages (68 total)
- **Packages**: `@claude-code/agent-[agent-id]`
- **Command**: `npx @claude-code/agent-[agent-id]`
- **Purpose**: Installs specific AI agents as Claude Code sub-agents

## Publishing Workflow

### 1. Generate All Packages
```bash
node generate-agent-packages.js
```
This creates package directories for all 68 agents from the agentLibraryData.js file.

### 2. Test Locally
```bash
./test-local.sh
```
Tests that packages work correctly before publishing.

### 3. Publish to NPM
```bash
npm login  # If not already logged in
./publish-all.sh
```
Publishes all packages to the NPM registry.

## Package Details

### Main Dashboard Connector
The dashboard connector package:
- Downloads the dashboard to `~/.claude/multi-agent-dashboard/`
- Installs all dependencies
- Starts backend server on port 3001
- Starts frontend on port 5174 (configurable)
- Configures Claude Code hooks automatically
- Maintains WebSocket connection for real-time updates

### Agent Packages
Each agent package:
- Creates an agent file in `.claude/agents/` directory
- Uses YAML frontmatter + markdown format
- Automatically discovered by Claude Code
- Includes proper tools and model configuration
- Ready for immediate use after installation

## Available Agents

### Core Development (8 agents)
- `npx @claude-code/agent-ai-engineer` - AI/ML Engineering Specialist
- `npx @claude-code/agent-backend-architect` - Backend Architecture Expert
- `npx @claude-code/agent-devops-automator` - DevOps Automation Specialist
- `npx @claude-code/agent-frontend-developer` - Frontend Development Expert
- `npx @claude-code/agent-mobile-app-builder` - Mobile App Development
- `npx @claude-code/agent-rapid-prototyper` - Quick Prototype Builder
- `npx @claude-code/agent-test-writer-fixer` - Test Creation & Fixing
- `npx @claude-code/agent-feedback-synthesizer` - User Feedback Analysis

### Project Management (3 agents)
- `npx @claude-code/agent-sprint-prioritizer` - Sprint Planning Expert
- `npx @claude-code/agent-project-shipper` - Project Delivery Manager
- `npx @claude-code/agent-claude-team-orchestrator` - Team Coordination

### Marketing & Growth (5 agents)
- `npx @claude-code/agent-trend-researcher` - Market Trend Analysis
- `npx @claude-code/agent-app-store-optimizer` - ASO Specialist
- `npx @claude-code/agent-content-creator` - Content Generation
- `npx @claude-code/agent-growth-hacker` - Growth Strategy Expert
- `npx @claude-code/agent-brand-guardian` - Brand Consistency Manager

### Design & UX (4 agents)
- `npx @claude-code/agent-ui-designer` - UI Design Specialist
- `npx @claude-code/agent-ux-researcher` - UX Research Expert
- `npx @claude-code/agent-visual-storyteller` - Visual Narrative Creator
- `npx @claude-code/agent-whimsy-injector` - Creative Enhancement

### Operations & Analytics (6 agents)
- `npx @claude-code/agent-experiment-tracker` - A/B Testing Manager
- `npx @claude-code/agent-studio-producer` - Production Coordinator
- `npx @claude-code/agent-analytics-reporter` - Data Analytics Expert
- `npx @claude-code/agent-finance-tracker` - Financial Analysis
- `npx @claude-code/agent-infrastructure-maintainer` - Infrastructure Management
- `npx @claude-code/agent-legal-compliance-checker` - Compliance Verification

### Quality & Testing (5 agents)
- `npx @claude-code/agent-api-tester` - API Testing Specialist
- `npx @claude-code/agent-performance-benchmarker` - Performance Testing
- `npx @claude-code/agent-test-results-analyzer` - Test Analysis Expert
- `npx @claude-code/agent-tool-evaluator` - Tool Assessment Specialist
- `npx @claude-code/agent-ai-penetration-qa` - Security Testing Expert

### Senior & Principal (6 agents)
- `npx @claude-code/agent-workflow-optimizer` - Process Optimization
- `npx @claude-code/agent-studio-coach` - Team Mentoring
- `npx @claude-code/agent-principal-architect` - System Architecture
- `npx @claude-code/agent-claude-ux-engineer` - Claude UX Specialist
- `npx @claude-code/agent-dataops-ai` - Data Operations Expert
- `npx @claude-code/agent-api-devrel-writer` - API Documentation

### Infrastructure & Security (7 agents)
- `npx @claude-code/agent-devsecops-compliance` - Security Compliance
- `npx @claude-code/agent-cloud-architect` - Cloud Infrastructure
- `npx @claude-code/agent-terraform-specialist` - Infrastructure as Code
- `npx @claude-code/agent-security-specialist` - Security Expert
- `npx @claude-code/agent-network-engineer` - Network Architecture
- `npx @claude-code/agent-incident-responder` - Incident Management
- `npx @claude-code/agent-devops-troubleshooter` - DevOps Problem Solving

### Specialized Development (10 agents)
- `npx @claude-code/agent-code-reviewer` - Code Review Expert
- `npx @claude-code/agent-react-specialist` - React.js Expert
- `npx @claude-code/agent-python-backend-specialist` - Python Backend Expert
- `npx @claude-code/agent-debugging-specialist` - Debugging Expert
- `npx @claude-code/agent-database-specialist` - Database Expert
- `npx @claude-code/agent-ml-engineer` - Machine Learning Engineer
- `npx @claude-code/agent-data-engineer` - Data Pipeline Expert
- `npx @claude-code/agent-prompt-engineer` - Prompt Optimization
- `npx @claude-code/agent-graphql-architect` - GraphQL API Design
- `npx @claude-code/agent-task-decomposition-expert` - Task Planning

### Data Science & Analytics (8 agents)
- `npx @claude-code/agent-literature-reviewer` - Research Literature Analysis
- `npx @claude-code/agent-hypothesis-tester` - Statistical Testing
- `npx @claude-code/agent-research-data-collector` - Data Collection
- `npx @claude-code/agent-etl-pipeline-builder` - ETL Development
- `npx @claude-code/agent-statistical-analyst` - Statistical Analysis
- `npx @claude-code/agent-data-visualizer` - Data Visualization
- `npx @claude-code/agent-anomaly-detector` - Anomaly Detection
- `npx @claude-code/agent-data-payments-integration` - Payment Data Integration

### Finance & Trading (4 agents)
- `npx @claude-code/agent-market-analyzer` - Market Analysis
- `npx @claude-code/agent-portfolio-optimizer` - Portfolio Management
- `npx @claude-code/agent-risk-assessor` - Risk Analysis
- `npx @claude-code/agent-backtesting-engine` - Strategy Backtesting

### Support & Documentation (2 agents)
- `npx @claude-code/agent-support-responder` - Customer Support
- `npx @claude-code/agent-globalization-agent` - Internationalization

## Usage Examples

### Quick Start
```bash
# Connect dashboard for monitoring
npx multi-agent-dashboard-connect

# Install a specific agent
npx @claude-code/agent-react-specialist

# Install multiple agents for a project
npx @claude-code/agent-frontend-developer
npx @claude-code/agent-ui-designer
npx @claude-code/agent-test-writer-fixer
```

### Project Setup Example
```bash
# For a new React project
npx @claude-code/agent-react-specialist
npx @claude-code/agent-frontend-developer
npx @claude-code/agent-ui-designer
npx @claude-code/agent-test-writer-fixer
npx @claude-code/agent-debugging-specialist

# Connect dashboard to monitor all agents
npx multi-agent-dashboard-connect
```

## Development

### Adding New Agents
1. Add agent to `agentLibraryData.js`
2. Run `node generate-agent-packages.js`
3. Test with `./test-local.sh`
4. Publish with `./publish-all.sh`

### Updating Existing Agents
1. Update version in package.json
2. Make changes to install script
3. Test locally
4. Publish update with `npm publish`

## Support

For issues or questions:
- GitHub: https://github.com/claude-code/multi-agent-dashboard
- NPM: https://www.npmjs.com/org/claude-code

## License

MIT