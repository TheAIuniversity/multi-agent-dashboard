import React, { useState } from 'react';
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

  const copyToClipboard = (text, section) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(section);
    setTimeout(() => setCopiedSection(null), 3000);
  };

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  // The complete hook code that users need to add to Claude Code
  const hookCode = `# Multi-Agent Dashboard Integration

# Add this to your Claude Code configuration or settings file:

{
  "hooks": {
    "user-prompt-submit-hook": "curl -X POST http://localhost:3001/events -H 'Content-Type: application/json' -d '{\"app\": \"{{app}}\", \"session_id\": \"{{session_id}}\", \"event_type\": \"UserPromptSubmit\", \"payload\": {\"prompt\": \"{{prompt}}\"}, \"summary\": \"User submitted prompt\"}'",
    "pre-tool-use-hook": "curl -X POST http://localhost:3001/events -H 'Content-Type: application/json' -d '{\"app\": \"{{app}}\", \"session_id\": \"{{session_id}}\", \"event_type\": \"PreToolUse\", \"payload\": {\"tool\": \"{{tool}}\", \"params\": {{params}}}, \"summary\": \"Using {{tool}}\"}'",
    "post-tool-use-hook": "curl -X POST http://localhost:3001/events -H 'Content-Type: application/json' -d '{\"app\": \"{{app}}\", \"session_id\": \"{{session_id}}\", \"event_type\": \"PostToolUse\", \"payload\": {\"tool\": \"{{tool}}\", \"result\": \"{{result}}\"}, \"summary\": \"Completed {{tool}}\"}'",
    "notification-hook": "curl -X POST http://localhost:3001/events -H 'Content-Type: application/json' -d '{\"app\": \"{{app}}\", \"session_id\": \"{{session_id}}\", \"event_type\": \"Notification\", \"payload\": {\"message\": \"{{message}}\", \"priority\": \"{{priority}}\"}, \"summary\": \"{{message}}\"}'",
    "stop-hook": "curl -X POST http://localhost:3001/events -H 'Content-Type: application/json' -d '{\"app\": \"{{app}}\", \"session_id\": \"{{session_id}}\", \"event_type\": \"Stop\", \"payload\": {}, \"summary\": \"Agent stopped\"}'",
    "sub-agent-stop-hook": "curl -X POST http://localhost:3001/events -H 'Content-Type: application/json' -d '{\"app\": \"{{app}}\", \"session_id\": \"{{session_id}}\", \"event_type\": \"SubAgentStop\", \"payload\": {\"agent\": \"{{agent}}\"}, \"summary\": \"Sub-agent {{agent}} completed\"}'",
    "pre-compact-hook": "curl -X POST http://localhost:3001/events -H 'Content-Type: application/json' -d '{\"app\": \"{{app}}\", \"session_id\": \"{{session_id}}\", \"event_type\": \"PreCompact\", \"payload\": {}, \"summary\": \"Compacting context\"}'"
  }
}`;

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
curl -X POST http://localhost:3001/events \\
  -H "Content-Type: application/json" \\
  -d '{
    "app": "test-agent",
    "session_id": "test-session",
    "event_type": "Notification",
    "payload": {"message": "Test connection successful!"},
    "summary": "Test event"
  }'`;

  // One-click setup prompt - Production Ready
  const oneClickPrompt = `Please set up my Claude Code to connect ALL agents (including sub-agents) to the Multi-Agent Dashboard. Do the following:

1. First, check if a Claude Code settings file exists. Common locations:
   - ~/.claude/settings.json
   - ~/.config/claude/settings.json
   - ~/Library/Application Support/Claude/settings.json
   - Or search for claude settings.json files

2. If no settings file exists, create one at ~/.claude/settings.json

3. Add or update the hooks section with these exact hooks that will make ALL agents report to the dashboard:

{
  "hooks": {
    "user-prompt-submit-hook": "curl -X POST http://localhost:3001/events -H 'Content-Type: application/json' -d '{\\"app\\": \\"{{app}}\\", \\"session_id\\": \\"{{session_id}}\\", \\"event_type\\": \\"UserPromptSubmit\\", \\"payload\\": {\\"prompt\\": \\"{{prompt}}\\"}, \\"summary\\": \\"User submitted prompt\\"}'",
    "pre-tool-use-hook": "curl -X POST http://localhost:3001/events -H 'Content-Type: application/json' -d '{\\"app\\": \\"{{app}}\\", \\"session_id\\": \\"{{session_id}}\\", \\"event_type\\": \\"PreToolUse\\", \\"payload\\": {\\"tool\\": \\"{{tool}}\\", \\"params\\": {{params}}}, \\"summary\\": \\"Using {{tool}}\\"}'",
    "post-tool-use-hook": "curl -X POST http://localhost:3001/events -H 'Content-Type: application/json' -d '{\\"app\\": \\"{{app}}\\", \\"session_id\\": \\"{{session_id}}\\", \\"event_type\\": \\"PostToolUse\\", \\"payload\\": {\\"tool\\": \\"{{tool}}\\", \\"result\\": \\"{{result}}\\"}, \\"summary\\": \\"Completed {{tool}}\\"}'",
    "stop-hook": "curl -X POST http://localhost:3001/events -H 'Content-Type: application/json' -d '{\\"app\\": \\"{{app}}\\", \\"session_id\\": \\"{{session_id}}\\", \\"event_type\\": \\"Stop\\", \\"payload\\": {}, \\"summary\\": \\"Agent stopped\\"}'",
    "notification-hook": "curl -X POST http://localhost:3001/events -H 'Content-Type: application/json' -d '{\\"app\\": \\"{{app}}\\", \\"session_id\\": \\"{{session_id}}\\", \\"event_type\\": \\"Notification\\", \\"payload\\": {\\"message\\": \\"{{message}}\\"}, \\"summary\\": \\"{{message}}\\"}'",
    "sub-agent-stop-hook": "curl -X POST http://localhost:3001/events -H 'Content-Type: application/json' -d '{\\"app\\": \\"{{app}}\\", \\"session_id\\": \\"{{session_id}}\\", \\"event_type\\": \\"SubAgentStop\\", \\"payload\\": {\\"agent\\": \\"{{agent}}\\"}, \\"summary\\": \\"Sub-agent {{agent}} completed\\"}'",
    "pre-compact-hook": "curl -X POST http://localhost:3001/events -H 'Content-Type: application/json' -d '{\\"app\\": \\"{{app}}\\", \\"session_id\\": \\"{{session_id}}\\", \\"event_type\\": \\"PreCompact\\", \\"payload\\": {}, \\"summary\\": \\"Compacting context\\"}'",
    "task-complete-hook": "curl -X POST http://localhost:3001/events -H 'Content-Type: application/json' -d '{\\"app\\": \\"{{app}}\\", \\"session_id\\": \\"{{session_id}}\\", \\"event_type\\": \\"TaskComplete\\", \\"payload\\": {\\"task\\": \\"{{task}}\\"}, \\"summary\\": \\"Task completed: {{task}}\\"}'",
    "error-hook": "curl -X POST http://localhost:3001/events -H 'Content-Type: application/json' -d '{\\"app\\": \\"{{app}}\\", \\"session_id\\": \\"{{session_id}}\\", \\"event_type\\": \\"Error\\", \\"payload\\": {\\"error\\": \\"{{error}}\\"}, \\"summary\\": \\"Error: {{error}}\\"}'",
    "sub-agent-create-hook": "curl -X POST http://localhost:3001/events -H 'Content-Type: application/json' -d '{\\"app\\": \\"{{app}}\\", \\"session_id\\": \\"{{session_id}}\\", \\"event_type\\": \\"SubAgentCreate\\", \\"payload\\": {\\"agent\\": \\"{{agent}}\\"}, \\"summary\\": \\"Created sub-agent: {{agent}}\\"}'",
    "context-switch-hook": "curl -X POST http://localhost:3001/events -H 'Content-Type: application/json' -d '{\\"app\\": \\"{{app}}\\", \\"session_id\\": \\"{{session_id}}\\", \\"event_type\\": \\"ContextSwitch\\", \\"payload\\": {\\"context\\": \\"{{context}}\\"}, \\"summary\\": \\"Switched context: {{context}}\\"}'",
    "file-change-hook": "curl -X POST http://localhost:3001/events -H 'Content-Type: application/json' -d '{\\"app\\": \\"{{app}}\\", \\"session_id\\": \\"{{session_id}}\\", \\"event_type\\": \\"FileChange\\", \\"payload\\": {\\"file\\": \\"{{file}}\\"}, \\"summary\\": \\"Modified: {{file}}\\"}'",
    "test-hook": "curl -X POST http://localhost:3001/events -H 'Content-Type: application/json' -d '{\\"app\\": \\"{{app}}\\", \\"session_id\\": \\"{{session_id}}\\", \\"event_type\\": \\"Test\\", \\"payload\\": {\\"status\\": \\"{{status}}\\"}, \\"summary\\": \\"Test: {{status}}\\"}'",
    "build-hook": "curl -X POST http://localhost:3001/events -H 'Content-Type: application/json' -d '{\\"app\\": \\"{{app}}\\", \\"session_id\\": \\"{{session_id}}\\", \\"event_type\\": \\"Build\\", \\"payload\\": {\\"status\\": \\"{{status}}\\"}, \\"summary\\": \\"Build: {{status}}\\"}'",
    "debug-hook": "curl -X POST http://localhost:3001/events -H 'Content-Type: application/json' -d '{\\"app\\": \\"{{app}}\\", \\"session_id\\": \\"{{session_id}}\\", \\"event_type\\": \\"Debug\\", \\"payload\\": {\\"message\\": \\"{{message}}\\"}, \\"summary\\": \\"Debug: {{message}}\\"}'",
    "memory-hook": "curl -X POST http://localhost:3001/events -H 'Content-Type: application/json' -d '{\\"app\\": \\"{{app}}\\", \\"session_id\\": \\"{{session_id}}\\", \\"event_type\\": \\"Memory\\", \\"payload\\": {\\"action\\": \\"{{action}}\\"}, \\"summary\\": \\"Memory: {{action}}\\"}'",
    "api-call-hook": "curl -X POST http://localhost:3001/events -H 'Content-Type: application/json' -d '{\\"app\\": \\"{{app}}\\", \\"session_id\\": \\"{{session_id}}\\", \\"event_type\\": \\"APICall\\", \\"payload\\": {\\"endpoint\\": \\"{{endpoint}}\\"}, \\"summary\\": \\"API: {{endpoint}}\\"}'",
    "workflow-start-hook": "curl -X POST http://localhost:3001/events -H 'Content-Type: application/json' -d '{\\"app\\": \\"{{app}}\\", \\"session_id\\": \\"{{session_id}}\\", \\"event_type\\": \\"WorkflowStart\\", \\"payload\\": {\\"workflow\\": \\"{{workflow}}\\"}, \\"summary\\": \\"Started workflow: {{workflow}}\\"}'",
    "workflow-end-hook": "curl -X POST http://localhost:3001/events -H 'Content-Type: application/json' -d '{\\"app\\": \\"{{app}}\\", \\"session_id\\": \\"{{session_id}}\\", \\"event_type\\": \\"WorkflowEnd\\", \\"payload\\": {\\"workflow\\": \\"{{workflow}}\\"}, \\"summary\\": \\"Completed workflow: {{workflow}}\\"}'",
    "git-hook": "curl -X POST http://localhost:3001/events -H 'Content-Type: application/json' -d '{\\"app\\": \\"{{app}}\\", \\"session_id\\": \\"{{session_id}}\\", \\"event_type\\": \\"Git\\", \\"payload\\": {\\"action\\": \\"{{action}}\\"}, \\"summary\\": \\"Git: {{action}}\\"}'",
    "deploy-hook": "curl -X POST http://localhost:3001/events -H 'Content-Type: application/json' -d '{\\"app\\": \\"{{app}}\\", \\"session_id\\": \\"{{session_id}}\\", \\"event_type\\": \\"Deploy\\", \\"payload\\": {\\"target\\": \\"{{target}}\\"}, \\"summary\\": \\"Deploy to: {{target}}\\"}'",
    "performance-hook": "curl -X POST http://localhost:3001/events -H 'Content-Type: application/json' -d '{\\"app\\": \\"{{app}}\\", \\"session_id\\": \\"{{session_id}}\\", \\"event_type\\": \\"Performance\\", \\"payload\\": {\\"metric\\": \\"{{metric}}\\"}, \\"summary\\": \\"Performance: {{metric}}\\"}'"
  }
}

4. After updating the settings file, verify it was saved correctly by reading it back

5. Test the connection by sending a test event:
   curl -X POST http://localhost:3001/events -H 'Content-Type: application/json' -d '{"app": "claude-code", "session_id": "setup-test", "event_type": "Notification", "payload": {"message": "Dashboard connected successfully!"}, "summary": "Setup complete"}'

6. Confirm that the Multi-Agent Dashboard at http://localhost:5173 received the test event

IMPORTANT: This will make ALL agents and sub-agents automatically report to the dashboard, including future agents you create. The hooks are inherited by all Claude Code operations.`;

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

      {/* Before You Start */}
      <div className="bg-yellow-900/20 border border-yellow-600 rounded-lg p-4 mb-6">
        <h3 className="font-medium mb-2 flex items-center gap-2 text-yellow-600">
          <FiAlertCircle className="w-5 h-5" />
          Before You Start
        </h3>
        <p className="text-sm text-claude-muted">
          Make sure this dashboard is running! You should see this page at <strong>http://localhost:5173</strong>. 
          If not, run the start script first (see below).
        </p>
      </div>

      {/* One-Click Setup - Production Ready! */}
      <div className="bg-green-900/20 border border-green-600 rounded-lg p-6 mb-6">
        <h3 className="font-bold text-lg mb-3 flex items-center gap-2 text-green-400">
          <FiZap className="w-5 h-5" />
          One-Click Setup - Copy This Single Prompt!
        </h3>
        <p className="text-sm text-claude-muted mb-4">
          This single prompt configures Claude Code to track ALL agents automatically:
        </p>
        <div className="relative bg-claude-bg rounded-lg p-4 mb-4">
          <p className="font-mono text-sm pr-24 whitespace-pre-wrap">
            {oneClickPrompt}
          </p>
          <button
            onClick={() => copyToClipboard(oneClickPrompt, 'oneclick')}
            className="absolute top-3 right-3 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded text-xs flex items-center gap-2 transition-colors"
          >
            {copiedSection === 'oneclick' ? (
              <>
                <FiCheckCircle className="w-3 h-3" />
                Copied!
              </>
            ) : (
              <>
                <FiCopy className="w-3 h-3" />
                Copy Setup
              </>
            )}
          </button>
        </div>
        <div className="bg-green-800/20 rounded-lg p-3">
          <p className="text-sm text-green-400 font-medium mb-1">✨ What this does:</p>
          <ul className="text-sm text-claude-muted space-y-1">
            <li>• Finds or creates Claude Code settings file</li>
            <li>• Adds ALL tracking hooks (tools, events, errors, etc.)</li>
            <li>• Tests the connection automatically</li>
            <li>• Works with all future agents you create</li>
          </ul>
        </div>
      </div>

      {/* Test Prompts */}
      <div className="bg-purple-900/20 border border-purple-600 rounded-lg p-6 mb-6">
        <h3 className="font-bold text-lg mb-3 flex items-center gap-2 text-purple-400">
          <FiPlay className="w-5 h-5" />
          Test Your Connection
        </h3>
        <p className="text-sm text-claude-muted mb-4">
          After setup, use these prompts to verify everything is working:
        </p>
        
        <div className="space-y-4">
          {/* Test Connection */}
          <div className="bg-claude-surface rounded-lg p-4">
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <FiCheckCircle className="w-4 h-4 text-green-500" />
              Test 1: Connection Test
            </h4>
            <div className="relative">
              <p className="font-mono text-sm pr-20 text-claude-muted">
                {testPrompts.connection}
              </p>
              <button
                onClick={() => copyToClipboard(testPrompts.connection, 'test1')}
                className="absolute top-0 right-0 px-2 py-1 bg-claude-bg hover:bg-claude-border rounded text-xs transition-colors"
              >
                {copiedSection === 'test1' ? <FiCheck className="w-3 h-3" /> : <FiCopy className="w-3 h-3" />}
              </button>
            </div>
          </div>

          {/* Test Agent */}
          <div className="bg-claude-surface rounded-lg p-4">
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <FiUsers className="w-4 h-4 text-blue-500" />
              Test 2: Agent Creation Test
            </h4>
            <div className="relative">
              <p className="font-mono text-sm pr-20 text-claude-muted">
                {testPrompts.agent}
              </p>
              <button
                onClick={() => copyToClipboard(testPrompts.agent, 'test2')}
                className="absolute top-0 right-0 px-2 py-1 bg-claude-bg hover:bg-claude-border rounded text-xs transition-colors"
              >
                {copiedSection === 'test2' ? <FiCheck className="w-3 h-3" /> : <FiCopy className="w-3 h-3" />}
              </button>
            </div>
          </div>

          {/* Test Workflow */}
          <div className="bg-claude-surface rounded-lg p-4">
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <FiActivity className="w-4 h-4 text-purple-500" />
              Test 3: Full Workflow Test
            </h4>
            <div className="relative">
              <p className="font-mono text-sm pr-20 text-claude-muted whitespace-pre-wrap">
                {testPrompts.workflow}
              </p>
              <button
                onClick={() => copyToClipboard(testPrompts.workflow, 'test3')}
                className="absolute top-0 right-0 px-2 py-1 bg-claude-bg hover:bg-claude-border rounded text-xs transition-colors"
              >
                {copiedSection === 'test3' ? <FiCheck className="w-3 h-3" /> : <FiCopy className="w-3 h-3" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Start */}
      <div className="bg-claude-surface rounded-lg border border-claude-border p-6 mb-6">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 bg-claude-accent/10 rounded-lg flex items-center justify-center flex-shrink-0">
            <FiAlertCircle className="w-5 h-5 text-claude-accent" />
          </div>
          <div>
            <h3 className="font-semibold text-lg mb-1">Step-by-Step Instructions</h3>
            <p className="text-sm text-claude-muted">
              For those who want to understand what's happening
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-claude-accent rounded-full flex items-center justify-center text-white font-medium text-sm">
              1
            </div>
            <p className="text-sm">Copy the hook configuration below</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-claude-accent rounded-full flex items-center justify-center text-white font-medium text-sm">
              2
            </div>
            <p className="text-sm">Add it to your Claude Code settings or configuration file</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-claude-accent rounded-full flex items-center justify-center text-white font-medium text-sm">
              3
            </div>
            <p className="text-sm">Start the dashboard using the provided script</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-claude-accent rounded-full flex items-center justify-center text-white font-medium text-sm">
              4
            </div>
            <p className="text-sm">Begin using Claude Code - all agents will automatically report to the dashboard</p>
          </div>
        </div>
      </div>

      {/* Collapsible Sections */}
      <div className="space-y-4">
        {/* Hook Configuration */}
        <div className="bg-claude-surface rounded-lg border border-claude-border overflow-hidden">
          <button
            onClick={() => toggleSection('hooks')}
            className="w-full px-6 py-4 flex items-center justify-between hover:bg-claude-bg transition-colors"
          >
            <div className="flex items-center gap-3">
              <FiCode className="w-5 h-5 text-claude-accent" />
              <h3 className="font-semibold">Claude Code Hook Configuration</h3>
              <span className="text-xs bg-claude-accent/10 text-claude-accent px-2 py-1 rounded">Required</span>
            </div>
            {expandedSection === 'hooks' ? <FiChevronDown /> : <FiChevronRight />}
          </button>
          
          {expandedSection === 'hooks' && (
            <div className="px-6 pb-6">
              <p className="text-sm text-claude-muted mb-4">
                Copy this complete configuration and add it to your Claude Code settings file. This enables real-time event reporting from all agents.
              </p>
              <div className="relative">
                <pre className="bg-claude-bg rounded-lg p-4 overflow-x-auto text-sm font-mono">
                  <code>{hookCode}</code>
                </pre>
                <button
                  onClick={() => copyToClipboard(hookCode, 'hooks')}
                  className="absolute top-3 right-3 px-3 py-1.5 bg-claude-accent hover:bg-claude-accent-hover text-white rounded text-sm flex items-center gap-2 transition-colors"
                >
                  {copiedSection === 'hooks' ? (
                    <>
                      <FiCheckCircle className="w-4 h-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <FiCopy className="w-4 h-4" />
                      Copy All
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Start Script */}
        <div className="bg-claude-surface rounded-lg border border-claude-border overflow-hidden">
          <button
            onClick={() => toggleSection('start')}
            className="w-full px-6 py-4 flex items-center justify-between hover:bg-claude-bg transition-colors"
          >
            <div className="flex items-center gap-3">
              <FiTerminal className="w-5 h-5 text-claude-accent" />
              <h3 className="font-semibold">Dashboard Start Script</h3>
            </div>
            {expandedSection === 'start' ? <FiChevronDown /> : <FiChevronRight />}
          </button>
          
          {expandedSection === 'start' && (
            <div className="px-6 pb-6">
              <p className="text-sm text-claude-muted mb-4">
                Save this script as `start-dashboard.sh` and run it to start the monitoring dashboard.
              </p>
              <div className="relative">
                <pre className="bg-claude-bg rounded-lg p-4 overflow-x-auto text-sm font-mono">
                  <code>{startScript}</code>
                </pre>
                <button
                  onClick={() => copyToClipboard(startScript, 'start')}
                  className="absolute top-3 right-3 px-3 py-1.5 bg-claude-accent hover:bg-claude-accent-hover text-white rounded text-sm flex items-center gap-2 transition-colors"
                >
                  {copiedSection === 'start' ? (
                    <>
                      <FiCheckCircle className="w-4 h-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <FiCopy className="w-4 h-4" />
                      Copy Script
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Environment Variables */}
        <div className="bg-claude-surface rounded-lg border border-claude-border overflow-hidden">
          <button
            onClick={() => toggleSection('env')}
            className="w-full px-6 py-4 flex items-center justify-between hover:bg-claude-bg transition-colors"
          >
            <div className="flex items-center gap-3">
              <FiServer className="w-5 h-5 text-claude-accent" />
              <h3 className="font-semibold">Environment Variables (Optional)</h3>
            </div>
            {expandedSection === 'env' ? <FiChevronDown /> : <FiChevronRight />}
          </button>
          
          {expandedSection === 'env' && (
            <div className="px-6 pb-6">
              <p className="text-sm text-claude-muted mb-4">
                Add these to your shell profile for persistent configuration.
              </p>
              <div className="relative">
                <pre className="bg-claude-bg rounded-lg p-4 overflow-x-auto text-sm font-mono">
                  <code>{envVariables}</code>
                </pre>
                <button
                  onClick={() => copyToClipboard(envVariables, 'env')}
                  className="absolute top-3 right-3 px-3 py-1.5 bg-claude-accent hover:bg-claude-accent-hover text-white rounded text-sm flex items-center gap-2 transition-colors"
                >
                  {copiedSection === 'env' ? (
                    <>
                      <FiCheckCircle className="w-4 h-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <FiCopy className="w-4 h-4" />
                      Copy Variables
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Test Connection */}
        <div className="bg-claude-surface rounded-lg border border-claude-border overflow-hidden">
          <button
            onClick={() => toggleSection('test')}
            className="w-full px-6 py-4 flex items-center justify-between hover:bg-claude-bg transition-colors"
          >
            <div className="flex items-center gap-3">
              <FiActivity className="w-5 h-5 text-claude-accent" />
              <h3 className="font-semibold">Test Connection</h3>
            </div>
            {expandedSection === 'test' ? <FiChevronDown /> : <FiChevronRight />}
          </button>
          
          {expandedSection === 'test' && (
            <div className="px-6 pb-6">
              <p className="text-sm text-claude-muted mb-4">
                Run this command to verify the connection is working properly.
              </p>
              <div className="relative">
                <pre className="bg-claude-bg rounded-lg p-4 overflow-x-auto text-sm font-mono">
                  <code>{testCommand}</code>
                </pre>
                <button
                  onClick={() => copyToClipboard(testCommand, 'test')}
                  className="absolute top-3 right-3 px-3 py-1.5 bg-claude-accent hover:bg-claude-accent-hover text-white rounded text-sm flex items-center gap-2 transition-colors"
                >
                  {copiedSection === 'test' ? (
                    <>
                      <FiCheckCircle className="w-4 h-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <FiCopy className="w-4 h-4" />
                      Copy Command
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Architecture Info */}
      <div className="mt-8 bg-claude-bg rounded-lg p-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <FiGitBranch className="w-5 h-5 text-claude-accent" />
          System Architecture
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-claude-surface rounded-lg p-4 border border-claude-border">
            <div className="flex items-center gap-3 mb-2">
              <FiServer className="w-5 h-5 text-claude-accent" />
              <h4 className="font-medium">Backend Server</h4>
            </div>
            <p className="text-sm text-claude-muted">
              Express.js server on port 3001 handling events and WebSocket connections
            </p>
          </div>
          <div className="bg-claude-surface rounded-lg p-4 border border-claude-border">
            <div className="flex items-center gap-3 mb-2">
              <FiMonitor className="w-5 h-5 text-claude-accent" />
              <h4 className="font-medium">Dashboard UI</h4>
            </div>
            <p className="text-sm text-claude-muted">
              React + Vite frontend on port 5173 for real-time visualization
            </p>
          </div>
          <div className="bg-claude-surface rounded-lg p-4 border border-claude-border">
            <div className="flex items-center gap-3 mb-2">
              <FiActivity className="w-5 h-5 text-claude-accent" />
              <h4 className="font-medium">WebSocket</h4>
            </div>
            <p className="text-sm text-claude-muted">
              Real-time event streaming on port 8766 for live updates
            </p>
          </div>
        </div>
      </div>

      {/* Troubleshooting */}
      <div className="mt-6 bg-yellow-900/20 border border-yellow-700 rounded-lg p-4">
        <h4 className="font-medium mb-2 flex items-center gap-2">
          <FiAlertCircle className="w-5 h-5 text-yellow-600" />
          Common Issues
        </h4>
        <ul className="space-y-2 text-sm text-claude-muted">
          <li className="flex items-start gap-2">
            <span className="text-yellow-600 mt-0.5">•</span>
            <span><strong>Dashboard not loading:</strong> Ensure ports 3001, 5173, and 8766 are not in use</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-yellow-600 mt-0.5">•</span>
            <span><strong>Events not showing:</strong> Check Claude Code hooks are properly configured</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-yellow-600 mt-0.5">•</span>
            <span><strong>Connection refused:</strong> Verify the backend server is running (check logs)</span>
          </li>
        </ul>
      </div>
    </div>
  );
}

export default AgentSetup;