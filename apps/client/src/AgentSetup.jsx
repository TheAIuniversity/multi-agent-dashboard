import React, { useState, useEffect } from 'react';
import { 
  FiSettings, FiCopy, FiCheckCircle, FiCode, FiTerminal,
  FiAlertCircle, FiGitBranch, FiFolder, FiDownload,
  FiServer, FiMonitor, FiActivity, FiPackage, FiChevronDown,
  FiChevronRight, FiExternalLink, FiPlay, FiZap, FiCheck, FiUsers
} from 'react-icons/fi';

function AgentSetup() {
  const [copiedSection, setCopiedSection] = useState(null);
  const [expandedSection, setExpandedSection] = useState('quick-setup');
  const [setupStatus, setSetupStatus] = useState('idle'); // idle, running, success, error
  const [user, setUser] = useState(null);
  const [apiKey, setApiKey] = useState(null);

  const copyToClipboard = (text, section) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(section);
    setTimeout(() => setCopiedSection(null), 3000);
  };

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  // Get user data on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      setUser(userData);
      
      // Check if we have a user-specific API key
      const userApiKeyStorageKey = `userApiKey_${userData.id}`;
      const savedApiKey = localStorage.getItem(userApiKeyStorageKey);
      
      if (savedApiKey) {
        setApiKey(savedApiKey);
      } else {
        // If logged in but no API key for this user, fetch or create one
        fetchOrCreateApiKey();
      }
    }
  }, []);

  const fetchOrCreateApiKey = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // First try to get existing keys
      const listResponse = await fetch('http://localhost:3001/api/keys', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (listResponse.ok) {
        const { keys } = await listResponse.json();
        
        // If user has no keys, create one
        if (keys.length === 0) {
          const createResponse = await fetch('http://localhost:3001/api/keys', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name: 'Dashboard Key' })
          });
          
          if (createResponse.ok) {
            const { apiKey: newKey } = await createResponse.json();
            setApiKey(newKey);
            // Store with user-specific key
            const userData = JSON.parse(localStorage.getItem('user'));
            localStorage.setItem(`userApiKey_${userData.id}`, newKey);
          }
        } else {
          // User has keys but we don't have the actual key value
          // Create a new key so they can see it
          console.log('User has existing API keys, creating a new one to display');
          const createResponse = await fetch('http://localhost:3001/api/keys', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name: 'Dashboard Key' })
          });
          
          if (createResponse.ok) {
            const { apiKey: newKey } = await createResponse.json();
            setApiKey(newKey);
            // Store with user-specific key
            const userData = JSON.parse(localStorage.getItem('user'));
            localStorage.setItem(`userApiKey_${userData.id}`, newKey);
          }
        }
      }
    } catch (error) {
      console.error('Failed to fetch/create API key:', error);
    }
  };

  // The complete hook code that users need to add to Claude Code
  const hookCode = apiKey ? `# Manual Hook Configuration (NOT RECOMMENDED)
# Use the personalized setup command above instead!

# This manual configuration requires adding your API key to EACH hook:
# Your API key: ${apiKey}

{
  "hooks": {
    "user-prompt-submit-hook": "curl -X POST http://localhost:3001/events -H 'Content-Type: application/json' -H 'X-API-Key: ${apiKey}' -d '{\"app\": \"{{app}}\", \"session_id\": \"{{session_id}}\", \"event_type\": \"UserPromptSubmit\", \"payload\": {\"prompt\": \"{{prompt}}\"}, \"summary\": \"User submitted prompt\"}'",
    "pre-tool-use-hook": "curl -X POST http://localhost:3001/events -H 'Content-Type: application/json' -H 'X-API-Key: ${apiKey}' -d '{\"app\": \"{{app}}\", \"session_id\": \"{{session_id}}\", \"event_type\": \"PreToolUse\", \"payload\": {\"tool\": \"{{tool}}\", \"params\": {{params}}}, \"summary\": \"Using {{tool}}\"}'"
,
    "post-tool-use-hook": "curl -X POST http://localhost:3001/events -H 'Content-Type: application/json' -H 'X-API-Key: ${apiKey}' -d '{\"app\": \"{{app}}\", \"session_id\": \"{{session_id}}\", \"event_type\": \"PostToolUse\", \"payload\": {\"tool\": \"{{tool}}\", \"result\": \"{{result}}\"}, \"summary\": \"Completed {{tool}}\"}'"
,
    "stop-hook": "curl -X POST http://localhost:3001/events -H 'Content-Type: application/json' -H 'X-API-Key: ${apiKey}' -d '{\"app\": \"{{app}}\", \"session_id\": \"{{session_id}}\", \"event_type\": \"Stop\", \"payload\": {}, \"summary\": \"Agent stopped\"}'"
,
    "notification-hook": "curl -X POST http://localhost:3001/events -H 'Content-Type: application/json' -H 'X-API-Key: ${apiKey}' -d '{\"app\": \"{{app}}\", \"session_id\": \"{{session_id}}\", \"event_type\": \"Notification\", \"payload\": {\"message\": \"{{message}}\"}, \"summary\": \"{{message}}\"}'"
,
    "error-hook": "curl -X POST http://localhost:3001/events -H 'Content-Type: application/json' -H 'X-API-Key: ${apiKey}' -d '{\"app\": \"{{app}}\", \"session_id\": \"{{session_id}}\", \"event_type\": \"Error\", \"payload\": {\"error\": \"{{error}}\"}, \"summary\": \"Error: {{error}}\"}'"
  }
}` : `# Please sign up or log in to get your personalized setup command`;

  const startScript = `#!/bin/bash
# Start Multi-Agent Dashboard

echo "🚀 Starting Multi-Agent Dashboard..."

# Kill any existing processes
lsof -ti:3001 | xargs kill -9 2>/dev/null || true
lsof -ti:5173 | xargs kill -9 2>/dev/null || true
lsof -ti:8766 | xargs kill -9 2>/dev/null || true

# Start backend server
cd apps/server
npm install
node index.js &

# Wait for backend
sleep 3

# Start frontend
cd ../client
npm install
npm run dev &

echo "✅ Dashboard running at http://localhost:5173"
echo "📡 Agents will report to ws://localhost:8766"`;

  const envVariables = `# Environment Variables for Agent Reporting
export CLAUDE_DASHBOARD_URL="http://localhost:3001"
export CLAUDE_WEBSOCKET_URL="ws://localhost:8766"
export CLAUDE_SESSION_ID="multi-agent-session-$(date +%s)"
export CLAUDE_AGENT_REPORTING=true`;

  const testCommand = `# Test if connection is working
curl -X POST http://localhost:3001/events \
  -H "Content-Type: application/json" \
  -d '{
    "app": "test-agent",
    "session_id": "test-session",
    "event_type": "Notification",
    "payload": {"message": "Test connection successful!"},
    "summary": "Test event"
  }'`;

  // NPX commands for reference
  const npxCommands = {
    setup: 'npx @multi-agent/setup',
    addAgent: 'npx @multi-agent/setup add-agent --file agent-prompt.txt',
    testConnection: 'npx @multi-agent/setup test',
    customDashboard: 'npx @multi-agent/setup --dashboard http://localhost:5174'
  };

  // Test prompts
  const testPrompts = {
    connection: `Please test the Multi-Agent Dashboard connection by sending a test notification event. The event should confirm that the dashboard is receiving events properly.`,
    
    agent: `Create a simple test agent called "Dashboard Test Agent" and use it to verify that new agents are being tracked in the Multi-Agent Dashboard. Have the agent perform a simple task like reading a file or writing a test message.`,
    
    workflow: `Demonstrate a complete workflow: 
1. Start a new task
2. Use multiple tools (Read, Write, Edit)
3. Complete the task
4. Verify all events appear in the dashboard

This will test the full event tracking pipeline.`
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-2 flex items-center gap-3">
          <FiSettings className="w-7 h-7 text-claude-accent" />
          Connect Claude Code to Your Dashboard
        </h2>
        <p className="text-claude-muted text-lg">
          Follow these simple steps to connect Claude Code and see all your AI agents in real-time
        </p>
      </div>



      {/* SIMPLE 2-STEP SETUP */}
      <div className="bg-orange-900/20 border border-orange-600 rounded-lg p-6 mb-6">
        <h3 className="font-bold text-lg mb-3 flex items-center gap-2 text-orange-400">
          <FiZap className="w-5 h-5" />
          Multi-Terminal Setup for Parallel Agents
        </h3>
        
        {/* Step 1: Launch Dashboard */}
        <div className="bg-claude-bg rounded-lg p-4 mb-4">
          <h4 className="font-medium mb-2 text-orange-400 flex items-center gap-2">
            <span className="bg-orange-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm">1</span>
            Launch the Dashboard (One Time Only)
          </h4>
          <p className="text-xs text-claude-muted mb-3">
            Run this in any terminal to start the dashboard:
          </p>
          
          {user ? (
            <div className="bg-orange-800/20 rounded-lg p-3">
              <div className="relative">
                <pre className="font-mono text-sm pr-20 bg-black/50 p-3 rounded overflow-x-auto">
{`npx multi-agent-dashboard-connect`}
                </pre>
                <button
                  onClick={() => copyToClipboard(`npx multi-agent-dashboard-connect`, 'personal-setup')}
                  className="absolute top-1 right-1 px-2 py-1 bg-orange-600 hover:bg-orange-700 text-white rounded text-xs flex items-center gap-1 transition-colors"
                >
                  {copiedSection === 'personal-setup' ? <FiCheck className="w-3 h-3" /> : <FiCopy className="w-3 h-3" />}
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-yellow-900/20 rounded-lg p-3 text-yellow-400 text-sm">
              <FiAlertCircle className="inline mr-2" />
              Please log in to see your personalized setup command
            </div>
          )}
        </div>
        
        {/* DONE! */}
        <div className="bg-orange-800/20 rounded-lg p-4">
          <h4 className="font-medium mb-2 text-orange-400 flex items-center gap-2">
            <FiCheckCircle className="w-5 h-5" />
            That's It! You're Connected!
          </h4>
          <p className="text-sm text-claude-muted mb-2">What happens when you run the command:</p>
          <ul className="text-xs text-gray-500 ml-4 space-y-1">
            <li>• Downloads and starts the dashboard on localhost:5174</li>
            <li>• Installs a hook in Claude Code to send events</li>
            <li>• Creates WebSocket connection between Claude → Dashboard</li>
            <li>• Live data flows: Every tool use, agent call appears instantly</li>
            <li>• Dashboard must stay open to capture events</li>
          </ul>
          <p className="text-xs text-gray-400 mt-3">
            Note: The dashboard runs locally on port 5174. Each user runs their own instance.
          </p>
        </div>
      </div>






      {/* Quick Troubleshooting */}
      <div className="mt-8 bg-claude-surface rounded-lg border border-claude-border p-4">
        <h4 className="font-medium mb-3 text-sm">Having Issues?</h4>
        <div className="space-y-2 text-xs text-claude-muted">
          <p><strong>Dashboard won't start?</strong> Kill stuck processes:</p>
          <pre className="bg-black/50 p-2 rounded font-mono">lsof -ti:3001 | xargs kill -9</pre>
          <p className="mt-2"><strong>No events showing?</strong> Make sure you ran the setup command from Step 2.</p>
        </div>
      </div>
    </div>
  );
}

export default AgentSetup;