import React, { useState, useEffect } from 'react';
import { 
  FiSettings, FiCopy, FiCheckCircle, FiCode, FiTerminal,
  FiAlertCircle, FiGitBranch, FiFolder, FiDownload,
  FiServer, FiMonitor, FiActivity, FiPackage, FiChevronDown,
  FiChevronRight, FiExternalLink, FiPlay, FiZap, FiCheck, FiUsers,
  FiRefreshCw, FiAlertTriangle, FiGrid
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

  // No need to duplicate agents here - they're in the Agent Catalog

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2 flex items-center gap-3">
          <FiSettings className="w-8 h-8 text-claude-accent" />
          Agent Setup & Configuration
        </h2>
        <p className="text-claude-muted text-lg">
          Complete setup for Multi-Agent Dashboard and 68 AI Agents
        </p>
      </div>

      {/* QUICK START - EVERYTHING IN ONE PLACE */}
      <div className="bg-claude-surface border border-orange-600/50 rounded-lg p-6 mb-6">
        <h3 className="font-bold text-lg mb-4 text-claude-accent">
          Quick Start Guide
        </h3>
        
        {/* Step 1: Start Dashboard */}
        <div className="bg-black/40 rounded-lg p-5 mb-4 border border-orange-600/50">
          <h4 className="font-bold mb-3 text-claude-accent flex items-center gap-2">
            <span className="bg-claude-accent text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">1</span>
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
                className="absolute top-1 right-1 px-3 py-1 bg-claude-accent hover:bg-claude-accent-hover text-white rounded text-xs flex items-center gap-1 transition-all"
              >
                {copiedSection === 'dashboard-cmd' ? <FiCheck className="w-3 h-3" /> : <FiCopy className="w-3 h-3" />}
                {copiedSection === 'dashboard-cmd' ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>
          
          <div className="bg-claude-bg rounded p-2 text-xs text-gray-400">
            <p>This starts the dashboard on localhost:5174 and configures hooks</p>
          </div>
        </div>
        
        {/* Step 2: Install Agents */}
        <div className="bg-black/40 rounded-lg p-5 mb-4 border border-orange-600/50">
          <h4 className="font-bold mb-3 text-claude-accent flex items-center gap-2">
            <span className="bg-claude-accent text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">2</span>
            Install AI Agents (Each Auto-Connects to Dashboard!)
          </h4>
          <p className="text-sm text-gray-300 mb-3">
            Browse our catalog of 68 specialized AI agents. Each agent automatically configures dashboard hooks when installed:
          </p>
          
          <div className="bg-claude-bg rounded p-4 mb-3">
            <p className="text-sm text-gray-300 font-medium mb-2">
              Example Commands:
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <code className="flex-1 bg-black/60 px-2 py-1 rounded text-xs font-mono text-green-400">
                  npx agent-ai-engineer@latest --yes
                </code>
                <button
                  onClick={() => copyToClipboard('npx agent-ai-engineer@latest --yes', 'ai-eng-cmd')}
                  className="px-2 py-1 bg-claude-accent hover:bg-claude-accent-hover text-white rounded text-xs"
                >
                  {copiedSection === 'ai-eng-cmd' ? 'Copied' : 'Copy'}
                </button>
              </div>
              <div className="flex items-center gap-2">
                <code className="flex-1 bg-black/60 px-2 py-1 rounded text-xs font-mono text-green-400">
                  npx agent-backend-architect@latest --yes
                </code>
                <button
                  onClick={() => copyToClipboard('npx agent-backend-architect@latest --yes', 'backend-cmd')}
                  className="px-2 py-1 bg-claude-accent hover:bg-claude-accent-hover text-white rounded text-xs"
                >
                  {copiedSection === 'backend-cmd' ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>
          </div>
          
          <div className="bg-claude-bg rounded p-3 text-xs mt-3">
            <p className="text-gray-300 font-medium mb-1">Each agent installation:</p>
            <ul className="text-gray-400 ml-4 space-y-1">
              <li>• Installs the agent to .claude/agents/</li>
              <li>• Configures dashboard hooks automatically</li>
              <li>• Shows up in dashboard immediately after Claude Code restart</li>
            </ul>
          </div>
        </div>
        
        {/* Step 3: Restart Claude Code */}
        <div className="bg-claude-surface border border-red-600/50 rounded-lg p-5">
          <h4 className="font-bold mb-3 text-red-400 flex items-center gap-2">
            <span className="bg-red-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">3</span>
            Restart Claude Code (Required)
          </h4>
          <div className="bg-claude-bg rounded p-3">
            <p className="text-gray-300 font-medium text-sm mb-2">
              Important: Restart Claude Code after installing agents for hooks to activate
            </p>
            <ol className="text-sm text-gray-400 space-y-1">
              <li>1. Close Claude Code completely (Cmd+Q / Alt+F4)</li>
              <li>2. Reopen Claude Code</li>
              <li>3. All agents will now report to the dashboard</li>
            </ol>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="bg-claude-surface rounded-lg border border-claude-border p-5 mb-6">
        <h4 className="font-medium mb-4 text-sm flex items-center gap-2">
          <FiActivity className="w-4 h-4 text-claude-accent" />
          How Our System Works
        </h4>
        <div className="space-y-3 text-sm">
          <div className="flex items-start gap-3">
            <div className="bg-claude-accent text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">1</div>
            <div>
              <p className="text-gray-300 font-medium">Dashboard Command</p>
              <p className="text-xs text-gray-500">Starts dashboard servers and creates base hooks configuration</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="bg-claude-accent text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">2</div>
            <div>
              <p className="text-gray-300 font-medium">Agent Installation</p>
              <p className="text-xs text-gray-500">Each agent adds its own hooks to ~/.claude/settings.json</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="bg-claude-accent text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">3</div>
            <div>
              <p className="text-gray-300 font-medium">Real-time Tracking</p>
              <p className="text-xs text-gray-500">Every Claude Code action is sent to dashboard via Python hooks</p>
            </div>
          </div>
        </div>
      </div>

      {/* Agent Catalog Reference */}
      <div className="bg-claude-surface rounded-lg border border-claude-border p-5 mb-6">
        <h4 className="font-medium mb-3 text-sm">
          Find All Agents in the Agent Catalog
        </h4>
        
        <p className="text-sm text-gray-400 mb-4">
          Browse our comprehensive catalog of 68 specialized AI agents in the Agent Management section.
        </p>
        
        <button
          onClick={() => {
            window.dispatchEvent(new CustomEvent('navigate-to-agent-catalog'));
          }}
          className="px-4 py-2 bg-claude-accent hover:bg-claude-accent-hover text-white rounded-lg text-sm font-medium flex items-center gap-2 transition-all"
        >
          <FiGrid className="w-4 h-4" />
          Open Agent Catalog
          <FiChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Troubleshooting */}
      <div className="bg-claude-surface rounded-lg border border-claude-border p-5">
        <h4 className="font-medium mb-4 text-sm flex items-center gap-2">
          <FiAlertCircle className="w-4 h-4 text-claude-accent" />
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
        <p className="mt-1">GitHub: <a href="https://github.com/TheAIuniversity/multi-agent-dashboard" target="_blank" rel="noopener noreferrer" className="text-claude-accent hover:underline">TheAIuniversity/multi-agent-dashboard</a></p>
      </div>
    </div>
  );
}

export default AgentSetup;