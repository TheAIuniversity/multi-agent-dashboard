import express from 'express';
import fs from 'fs';
import path from 'path';

const router = express.Router();

// Generate personalized setup script for a user
router.get('/:userId', async (req, res) => {
  const { userId } = req.params;
  const { apiKey } = req.query; // Get API key from query parameter
  
  // If no API key provided, use userId for backward compatibility
  const authKey = apiKey || userId;
  
  const setupScript = `#!/bin/bash
# 🚀 Multi-Agent Dashboard Setup for User: ${userId}
# This script configures Claude Code to send ALL events to your dashboard

set -e

echo "🚀 Multi-Agent Dashboard - One-Command Setup"
echo "==========================================="
echo ""

# Colors for output
GREEN='\\033[0;32m'
BLUE='\\033[0;34m'
YELLOW='\\033[1;33m'
RED='\\033[0;31m'
NC='\\033[0m' # No Color

# Your dashboard URL
DASHBOARD_URL="${req.protocol}://${req.get('host')}"
API_KEY="${authKey}" # Your secure API key

# Find Claude settings file
CLAUDE_SETTINGS_DIR="$HOME/.claude"
CLAUDE_SETTINGS_FILE="$CLAUDE_SETTINGS_DIR/settings.json"

echo -e "\${BLUE}📁 Setting up Claude Code hooks...\${NC}"

# Create .claude directory if it doesn't exist
mkdir -p "$CLAUDE_SETTINGS_DIR"

# Backup existing settings if they exist
if [ -f "$CLAUDE_SETTINGS_FILE" ]; then
  cp "$CLAUDE_SETTINGS_FILE" "$CLAUDE_SETTINGS_FILE.backup.\$(date +%Y%m%d_%H%M%S)"
  echo -e "\${GREEN}✅ Backed up existing settings\${NC}"
fi

# Create or update settings with hooks
cat > "$CLAUDE_SETTINGS_FILE" << 'EOF'
{
  "hooks": {
    "user-prompt-submit-hook": "curl -X POST ${DASHBOARD_URL}/events -H 'Content-Type: application/json' -H 'X-API-Key: ${API_KEY}' -d '{\"app\": \"{{app}}\", \"session_id\": \"{{session_id}}\", \"event_type\": \"UserPromptSubmit\", \"payload\": {\"prompt\": \"{{prompt}}\"}, \"summary\": \"User submitted prompt\"}'",
    "pre-tool-use-hook": "curl -X POST ${DASHBOARD_URL}/events -H 'Content-Type: application/json' -H 'X-API-Key: ${API_KEY}' -d '{\"app\": \"{{app}}\", \"session_id\": \"{{session_id}}\", \"event_type\": \"PreToolUse\", \"payload\": {\"tool\": \"{{tool}}\", \"params\": {{params}}}, \"summary\": \"Using {{tool}}\"}'",
    "post-tool-use-hook": "curl -X POST ${DASHBOARD_URL}/events -H 'Content-Type: application/json' -H 'X-API-Key: ${API_KEY}' -d '{\"app\": \"{{app}}\", \"session_id\": \"{{session_id}}\", \"event_type\": \"PostToolUse\", \"payload\": {\"tool\": \"{{tool}}\", \"result\": \"{{result}}\"}, \"summary\": \"Completed {{tool}}\"}'",
    "stop-hook": "curl -X POST ${DASHBOARD_URL}/events -H 'Content-Type: application/json' -H 'X-API-Key: ${API_KEY}' -d '{\"app\": \"{{app}}\", \"session_id\": \"{{session_id}}\", \"event_type\": \"Stop\", \"payload\": {}, \"summary\": \"Agent stopped\"}'",
    "notification-hook": "curl -X POST ${DASHBOARD_URL}/events -H 'Content-Type: application/json' -H 'X-API-Key: ${API_KEY}' -d '{\"app\": \"{{app}}\", \"session_id\": \"{{session_id}}\", \"event_type\": \"Notification\", \"payload\": {\"message\": \"{{message}}\"}, \"summary\": \"{{message}}\"}'",
    "sub-agent-stop-hook": "curl -X POST ${DASHBOARD_URL}/events -H 'Content-Type: application/json' -H 'X-API-Key: ${API_KEY}' -d '{\"app\": \"{{app}}\", \"session_id\": \"{{session_id}}\", \"event_type\": \"SubAgentStop\", \"payload\": {\"agent\": \"{{agent}}\"}, \"summary\": \"Sub-agent {{agent}} completed\"}'",
    "error-hook": "curl -X POST ${DASHBOARD_URL}/events -H 'Content-Type: application/json' -H 'X-API-Key: ${API_KEY}' -d '{\"app\": \"{{app}}\", \"session_id\": \"{{session_id}}\", \"event_type\": \"Error\", \"payload\": {\"error\": \"{{error}}\"}, \"summary\": \"Error: {{error}}\"}'"
  }
}
EOF

echo -e "\${GREEN}✅ Claude Code hooks configured!\${NC}"
echo ""

# Test the connection
echo -e "\${BLUE}🧪 Testing connection to dashboard...\${NC}"
TEST_RESPONSE=\$(curl -s -w "\\n%{http_code}" -X POST ${DASHBOARD_URL}/events \\
  -H 'Content-Type: application/json' \\
  -H 'X-API-Key: ${API_KEY}' \\
  -d '{"app":"test-setup","event_type":"Notification","session_id":"test-setup","payload":{"message":"Setup completed!"},"summary":"Setup test"}' 2>/dev/null)

HTTP_CODE=\$(echo "\$TEST_RESPONSE" | tail -n1)
RESPONSE_BODY=\$(echo "\$TEST_RESPONSE" | head -n-1)

if [ "\$HTTP_CODE" = "200" ] || [ "\$HTTP_CODE" = "201" ]; then
  echo -e "\${GREEN}✅ Successfully connected to dashboard!\${NC}"
else
  echo -e "\${YELLOW}⚠️  Connection test returned HTTP \$HTTP_CODE\${NC}"
  echo -e "Response: \$RESPONSE_BODY"
fi

echo ""
echo -e "\${GREEN}🎉 Setup complete!\${NC}"
echo ""
echo "What happens now:"
echo "1. ✅ Every 'claude' command you run will be monitored"
echo "2. ✅ Your orchestrator's 20+ agents will ALL connect automatically"
echo "3. ✅ Sub-agents spawned by agents will also connect"
echo "4. ✅ Everything shows up in your dashboard at ${DASHBOARD_URL}"
echo ""
echo "Try it now:"
echo -e "\${BLUE}claude \"Hello, test my dashboard connection\"\${NC}"
echo ""
echo "Your User ID: ${userId}"
echo "Dashboard: ${DASHBOARD_URL}"
`;

  res.setHeader('Content-Type', 'text/plain');
  res.setHeader('Content-Disposition', 'inline');
  res.send(setupScript);
});

// Get setup command for a user
router.get('/:userId/command', (req, res) => {
  const { userId } = req.params;
  const host = req.get('host') || 'localhost:3001';
  const protocol = req.secure ? 'https' : 'http';
  
  const command = `curl -sL ${protocol}://${host}/api/user-setup/${userId} | bash`;
  
  res.json({ 
    command,
    userId,
    dashboardUrl: `${protocol}://${host}`
  });
});

export default router;