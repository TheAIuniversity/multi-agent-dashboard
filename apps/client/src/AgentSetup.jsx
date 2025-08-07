import React, { useState, useEffect } from 'react';
import { 
  FiSettings, FiCopy, FiCheckCircle, FiCode, FiTerminal,
  FiAlertCircle, FiGitBranch, FiFolder, FiDownload,
  FiServer, FiMonitor, FiActivity, FiPackage, FiChevronDown,
  FiChevronRight, FiExternalLink, FiPlay, FiZap, FiCheck, FiUsers,
  FiRefreshCw, FiAlertTriangle
} from 'react-icons/fi';

function AgentSetup() {
  const [copiedSection, setCopiedSection] = useState(null);
  const [expandedSection, setExpandedSection] = useState('quick-setup');
  const [setupStatus, setSetupStatus] = useState('idle');
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
      console.error('Error fetching/creating API key:', error);
    }
  };

  // Our 68 agents with proper --yes flag format
  const ourAgents = [
    { name: 'AI Engineer', cmd: 'npx agent-ai-engineer@latest --yes' },
    { name: 'Analytics Reporter', cmd: 'npx agent-analytics-reporter@latest --yes' },
    { name: 'Workflow Optimizer', cmd: 'npx agent-workflow-optimizer@latest --yes' },
    { name: 'Claude Team Orchestrator', cmd: 'npx agent-claude-team-orchestrator@latest --yes' },
    { name: 'Backend Architect', cmd: 'npx agent-backend-architect@latest --yes' },
    { name: 'Frontend Developer', cmd: 'npx agent-frontend-developer@latest --yes' },
    { name: 'Database Specialist', cmd: 'npx agent-database-specialist@latest --yes' },
    { name: 'Security Specialist', cmd: 'npx agent-security-specialist@latest --yes' },
    { name: 'DevOps Automator', cmd: 'npx agent-devops-automator@latest --yes' },
    { name: 'ML Engineer', cmd: 'npx agent-ml-engineer@latest --yes' },
    { name: 'Prompt Engineer', cmd: 'npx agent-prompt-engineer@latest --yes' },
    { name: 'API Tester', cmd: 'npx agent-api-tester@latest --yes' }
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2 flex items-center gap-3">
          <FiSettings className="w-8 h-8 text-orange-400" />
          Agent Setup & Configuration
        </h2>
        <p className="text-claude-muted text-lg">
          Complete setup for Multi-Agent Dashboard and 68 AI Agents
        </p>
      </div>

      {/* QUICK START - EVERYTHING IN ONE PLACE */}
      <div className="bg-gradient-to-r from-orange-900/30 to-orange-800/20 border-2 border-orange-500 rounded-xl p-6 mb-6">
        <h3 className="font-bold text-xl mb-4 flex items-center gap-2 text-orange-300">
          <FiZap className="w-6 h-6" />
          Quick Start - Complete Setup
        </h3>
        
        {/* Step 1: Start Dashboard */}
        <div className="bg-black/40 rounded-lg p-5 mb-4 border border-orange-600/50">
          <h4 className="font-bold mb-3 text-orange-400 flex items-center gap-2">
            <span className="bg-orange-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">1</span>
            Start the Multi-Agent Dashboard
          </h4>
          <p className="text-sm text-gray-300 mb-3">
            Run this command to start the dashboard (keep terminal open):
          </p>
          
          <div className="bg-black/60 rounded-lg p-3 mb-3">
            <div className="relative">
              <pre className="font-mono text-sm pr-20 overflow-x-auto text-green-400">
npx multi-agent-dashboard-connect@latest
              </pre>
              <button
                onClick={() => copyToClipboard('npx multi-agent-dashboard-connect@latest', 'dashboard-cmd')}
                className="absolute top-1 right-1 px-3 py-1 bg-orange-600 hover:bg-orange-700 text-white rounded text-xs flex items-center gap-1 transition-all hover:scale-105"
              >
                {copiedSection === 'dashboard-cmd' ? <FiCheck className="w-3 h-3" /> : <FiCopy className="w-3 h-3" />}
                {copiedSection === 'dashboard-cmd' ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>
          
          <div className="bg-green-900/30 border border-green-600/30 rounded p-2 text-xs">
            <p className="text-green-400">✅ This starts the dashboard on localhost:5174 and configures hooks</p>
          </div>
        </div>
        
        {/* Step 2: Install Agents */}
        <div className="bg-black/40 rounded-lg p-5 mb-4 border border-orange-600/50">
          <h4 className="font-bold mb-3 text-orange-400 flex items-center gap-2">
            <span className="bg-orange-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">2</span>
            Install AI Agents (Each Auto-Connects to Dashboard!)
          </h4>
          <p className="text-sm text-gray-300 mb-3">
            Each agent automatically configures dashboard hooks when installed:
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-64 overflow-y-auto">
            {ourAgents.map((agent, idx) => (
              <div key={idx} className="bg-black/60 rounded p-2 flex items-center justify-between">
                <div className="flex-1">
                  <span className="text-xs text-gray-400">{agent.name}:</span>
                  <code className="text-xs text-green-400 font-mono block truncate pr-2">{agent.cmd}</code>
                </div>
                <button
                  onClick={() => copyToClipboard(agent.cmd, `agent-cmd-${idx}`)}
                  className="px-2 py-1 bg-orange-600 hover:bg-orange-700 text-white rounded text-xs flex-shrink-0"
                >
                  {copiedSection === `agent-cmd-${idx}` ? '✓' : 'Copy'}
                </button>
              </div>
            ))}
          </div>
          
          <div className="bg-blue-900/30 border border-blue-600/30 rounded p-2 text-xs mt-3">
            <p className="text-blue-400">💡 Each agent installation:</p>
            <ul className="text-gray-400 ml-4 mt-1">
              <li>• Installs the agent to .claude/agents/</li>
              <li>• Configures dashboard hooks automatically</li>
              <li>• Shows up in dashboard immediately after Claude Code restart</li>
            </ul>
          </div>
        </div>
        
        {/* Step 3: Restart Claude Code */}
        <div className="bg-red-900/30 border-2 border-red-600 rounded-lg p-5">
          <h4 className="font-bold mb-3 text-red-400 flex items-center gap-2">
            <span className="bg-red-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold animate-pulse">3</span>
            <FiAlertTriangle className="w-5 h-5" />
            Restart Claude Code (CRITICAL!)
          </h4>
          <div className="bg-red-950/50 border border-red-700 rounded p-3">
            <p className="text-red-300 font-bold text-sm">
              ⚠️ MUST restart Claude Code after installing agents for hooks to activate!
            </p>
            <ol className="text-sm text-gray-300 mt-2 space-y-1">
              <li>1. Close Claude Code completely (Cmd+Q / Alt+F4)</li>
              <li>2. Reopen Claude Code</li>
              <li>3. All agents will now report to the dashboard!</li>
            </ol>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="bg-claude-surface rounded-lg border border-claude-border p-5 mb-6">
        <h4 className="font-medium mb-4 text-sm flex items-center gap-2">
          <FiActivity className="w-4 h-4 text-orange-400" />
          How Our System Works
        </h4>
        <div className="space-y-3 text-sm">
          <div className="flex items-start gap-3">
            <div className="bg-orange-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">1</div>
            <div>
              <p className="text-gray-300 font-medium">Dashboard Command</p>
              <p className="text-xs text-gray-500">Starts dashboard servers and creates base hooks configuration</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="bg-orange-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">2</div>
            <div>
              <p className="text-gray-300 font-medium">Agent Installation</p>
              <p className="text-xs text-gray-500">Each agent adds its own hooks to ~/.claude/settings.json</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="bg-orange-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">3</div>
            <div>
              <p className="text-gray-300 font-medium">Real-time Tracking</p>
              <p className="text-xs text-gray-500">Every Claude Code action is sent to dashboard via Python hooks</p>
            </div>
          </div>
        </div>
      </div>

      {/* All 68 Agents List */}
      <div className="bg-claude-surface rounded-lg border border-claude-border p-5 mb-6">
        <h4 className="font-medium mb-4 text-sm flex items-center gap-2">
          <FiPackage className="w-4 h-4 text-orange-400" />
          All 68 AI Agents Available
        </h4>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
          <div className="bg-black/30 rounded p-2">AI Engineer</div>
          <div className="bg-black/30 rounded p-2">Analytics Reporter</div>
          <div className="bg-black/30 rounded p-2">Workflow Optimizer</div>
          <div className="bg-black/30 rounded p-2">Claude Team Orchestrator</div>
          <div className="bg-black/30 rounded p-2">Backend Architect</div>
          <div className="bg-black/30 rounded p-2">Frontend Developer</div>
          <div className="bg-black/30 rounded p-2">Database Specialist</div>
          <div className="bg-black/30 rounded p-2">Security Specialist</div>
          <div className="bg-black/30 rounded p-2">DevOps Automator</div>
          <div className="bg-black/30 rounded p-2">ML Engineer</div>
          <div className="bg-black/30 rounded p-2">API Tester</div>
          <div className="bg-black/30 rounded p-2">Cloud Architect</div>
          <div className="bg-black/30 rounded p-2">Data Engineer</div>
          <div className="bg-black/30 rounded p-2">Prompt Engineer</div>
          <div className="bg-black/30 rounded p-2">React Specialist</div>
          <div className="bg-black/30 rounded p-2">Python Backend Specialist</div>
          <div className="bg-black/30 rounded p-2">Test Writer Fixer</div>
          <div className="bg-black/30 rounded p-2">Code Reviewer</div>
          <div className="bg-black/30 rounded p-2">Debugging Specialist</div>
          <div className="bg-black/30 rounded p-2">Performance Benchmarker</div>
          <div className="bg-black/30 rounded p-2">Incident Responder</div>
          <div className="bg-black/30 rounded p-2">Infrastructure Maintainer</div>
          <div className="bg-black/30 rounded p-2">Network Engineer</div>
          <div className="bg-black/30 rounded p-2">... and 45 more!</div>
        </div>
        
        <div className="mt-4 p-3 bg-yellow-900/20 border border-yellow-600/30 rounded text-xs">
          <p className="text-yellow-400">
            <strong>Note:</strong> All agents use the format: <code>npx agent-[name]@latest --yes</code>
          </p>
        </div>
      </div>

      {/* Troubleshooting */}
      <div className="bg-claude-surface rounded-lg border border-claude-border p-5">
        <h4 className="font-medium mb-4 text-sm flex items-center gap-2">
          <FiAlertCircle className="w-4 h-4 text-orange-400" />
          Troubleshooting
        </h4>
        <div className="space-y-3">
          <div className="bg-black/30 rounded p-3">
            <p className="text-sm font-medium text-gray-300 mb-2">Dashboard not receiving events?</p>
            <ul className="text-xs text-gray-500 space-y-1 ml-4">
              <li>• Make sure you restarted Claude Code after installing agents</li>
              <li>• Check dashboard is running: <code className="bg-black/50 px-1 rounded">curl http://localhost:3001/health</code></li>
              <li>• Verify hooks in: <code className="bg-black/50 px-1 rounded">~/.claude/settings.json</code></li>
            </ul>
          </div>
          
          <div className="bg-black/30 rounded p-3">
            <p className="text-sm font-medium text-gray-300 mb-2">Port conflicts?</p>
            <pre className="bg-black/50 p-2 rounded font-mono text-xs text-green-400">
pkill -f "node index.js"; pkill -f vite
            </pre>
          </div>
        </div>
      </div>

      {/* Version Info */}
      <div className="mt-6 text-center text-xs text-gray-500">
        <p>Dashboard v3.0.0 • 68 AI Agents v2.0.0+ • All agents auto-connect to dashboard</p>
        <p className="mt-1">GitHub: <a href="https://github.com/TheAIuniversity/multi-agent-dashboard" target="_blank" rel="noopener noreferrer" className="text-orange-400 hover:underline">TheAIuniversity/multi-agent-dashboard</a></p>
      </div>
    </div>
  );
}

export default AgentSetup;