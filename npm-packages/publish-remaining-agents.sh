#!/bin/bash

# List of all agents
agents=(
  "agent-workflow-optimizer"
  "agent-api-tester"
  "agent-app-store-optimizer"
  "agent-backend-architect"
  "agent-backtesting-engine"
  "agent-brand-guardian"
  "agent-claude-team-orchestrator"
  "agent-claude-ux-engineer"
  "agent-cloud-architect"
  "agent-code-reviewer"
  "agent-content-creator"
  "agent-data-engineer"
  "agent-data-payments-integration"
  "agent-data-visualizer"
  "agent-database-specialist"
  "agent-dataops-ai"
  "agent-debugging-specialist"
  "agent-devops-automator"
  "agent-devops-troubleshooter"
  "agent-devsecops-compliance"
  "agent-etl-pipeline-builder"
  "agent-experiment-tracker"
  "agent-feedback-synthesizer"
  "agent-finance-tracker"
  "agent-frontend-developer"
  "agent-globalization-agent"
  "agent-graphql-architect"
  "agent-growth-hacker"
  "agent-hypothesis-tester"
  "agent-incident-responder"
  "agent-infrastructure-maintainer"
  "agent-legal-compliance-checker"
  "agent-literature-reviewer"
  "agent-market-analyzer"
  "agent-ml-engineer"
  "agent-mobile-app-builder"
  "agent-network-engineer"
  "agent-performance-benchmarker"
  "agent-portfolio-optimizer"
  "agent-principal-architect"
  "agent-project-shipper"
  "agent-prompt-engineer"
  "agent-python-backend-specialist"
  "agent-rapid-prototyper"
  "agent-react-specialist"
  "agent-research-data-collector"
  "agent-risk-assessor"
  "agent-security-specialist"
  "agent-sprint-prioritizer"
  "agent-statistical-analyst"
  "agent-studio-coach"
  "agent-studio-producer"
  "agent-support-responder"
  "agent-task-decomposition-expert"
  "agent-terraform-specialist"
  "agent-test-results-analyzer"
  "agent-test-writer-fixer"
  "agent-tool-evaluator"
  "agent-trend-researcher"
  "agent-ui-designer"
  "agent-ux-researcher"
  "agent-visual-storyteller"
  "agent-whimsy-injector"
  "agent-ai-penetration-qa"
)

count=0
for agent in "${agents[@]}"; do
  # Check if already published at v2.0.0
  version=$(npm view "$agent" version 2>/dev/null)
  
  if [ "$version" != "2.0.0" ]; then
    echo "Publishing $agent..."
    cd "$agent"
    npm publish 2>&1
    result=$?
    cd ..
    
    if [ $result -eq 0 ]; then
      echo "✅ Published $agent"
      count=$((count + 1))
    else
      echo "⚠️ Failed to publish $agent (possibly rate limited)"
    fi
    
    # Add delay every 5 packages to avoid rate limiting
    if [ $((count % 5)) -eq 0 ] && [ $count -gt 0 ]; then
      echo "⏳ Waiting 10 seconds to avoid rate limiting..."
      sleep 10
    fi
  else
    echo "✓ $agent already published at v2.0.0"
  fi
done

echo "🎉 Finished! Published $count new agents."