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

  const SetupSection = ({ 
    icon: Icon, 
    title, 
    description, 
    code, 
    codeType = 'bash',
    sectionId,
    children 
  }) => (
    <div className="bg-claude-surface rounded-lg border border-claude-border mb-4 overflow-hidden">
      <div 
        className="p-4 cursor-pointer hover:bg-claude-surface-hover transition-colors flex items-center justify-between"
        onClick={() => toggleSection(sectionId)}
      >
        <div className="flex items-center gap-3">
          <Icon className="w-5 h-5 text-orange-400" />
          <div>
            <h3 className="font-medium text-white">{title}</h3>
            <p className="text-xs text-claude-muted mt-1">{description}</p>
          </div>
        </div>
        {expandedSection === sectionId ? 
          <FiChevronDown className="w-5 h-5 text-claude-muted" /> : 
          <FiChevronRight className="w-5 h-5 text-claude-muted" />
        }
      </div>
      
      {expandedSection === sectionId && (
        <div className="border-t border-claude-border p-4">
          {code && (
            <div className="relative mb-4">
              <pre className={`bg-black/50 p-3 rounded text-sm overflow-x-auto font-mono ${
                codeType === 'json' ? 'language-json' : 'language-bash'
              }`}>
                {code}
              </pre>
              <button
                onClick={() => copyToClipboard(code, sectionId)}
                className="absolute top-2 right-2 px-2 py-1 bg-orange-600 hover:bg-orange-700 text-white rounded text-xs flex items-center gap-1 transition-colors"
              >
                {copiedSection === sectionId ? <FiCheck className="w-3 h-3" /> : <FiCopy className="w-3 h-3" />}
                {copiedSection === sectionId ? 'Copied!' : 'Copy'}
              </button>
            </div>
          )}
          {children}
        </div>
      )}
    </div>
  );

  // Sample agent commands for both formats
  const ourAgents = [
    'npx agent-ai-engineer@latest',
    'npx agent-analytics-reporter@latest',
    'npx agent-workflow-optimizer@latest',
    'npx agent-claude-team-orchestrator@latest'
  ];

  const claudeTemplateAgents = [
    'npx claude-code-templates@latest --agent=ai-specialists/hackathon-ai-strategist --yes',
    'npx claude-code-templates@latest --agent=database/database-admin --yes',
    'npx claude-code-templates@latest --agent=frontend/react-developer --yes'
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
          Connect Claude Code to the Multi-Agent Dashboard and install AI agents
        </p>
      </div>

      {/* COMPLETE 3-STEP SETUP GUIDE */}
      <div className="bg-orange-900/20 border border-orange-600 rounded-lg p-6 mb-6">
        <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-orange-400">
          <FiZap className="w-5 h-5" />
          Complete Setup Guide - Ready in 3 Steps!
        </h3>
        
        {/* Step 1: Run NPX Command */}
        <div className="bg-claude-bg rounded-lg p-5 mb-4 border border-claude-border">
          <h4 className="font-medium mb-3 text-orange-400 flex items-center gap-2">
            <span className="bg-orange-600 text-white w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold">1</span>
            Open Claude Code Terminal & Run This Command
          </h4>
          <p className="text-sm text-claude-muted mb-3">
            This single command sets up everything automatically:
          </p>
          
          <div className="bg-black/60 rounded-lg p-3 mb-3">
            <div className="relative">
              <pre className="font-mono text-sm pr-20 overflow-x-auto text-green-400">
npx multi-agent-dashboard-connect@latest
              </pre>
              <button
                onClick={() => copyToClipboard('npx multi-agent-dashboard-connect@latest', 'setup-command')}
                className="absolute top-1 right-1 px-3 py-1 bg-orange-600 hover:bg-orange-700 text-white rounded text-xs flex items-center gap-1 transition-all hover:scale-105"
              >
                {copiedSection === 'setup-command' ? <FiCheck className="w-3 h-3" /> : <FiCopy className="w-3 h-3" />}
                {copiedSection === 'setup-command' ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>
          
          <div className="bg-green-900/20 border border-green-600/30 rounded p-3 text-xs">
            <p className="text-green-400 font-medium mb-2">✨ What happens automatically:</p>
            <ul className="text-gray-400 space-y-1 ml-4">
              <li>📥 Downloads dashboard from GitHub (30 seconds)</li>
              <li>📦 Installs all dependencies</li>
              <li>🔧 Creates Python hook script at ~/.claude/hooks/</li>
              <li>⚙️ Configures hooks in ~/.claude/settings.json</li>
              <li>🚀 Starts servers (API:3001, UI:5174, WebSocket:8766)</li>
              <li>🌐 Opens dashboard in your browser</li>
            </ul>
          </div>
        </div>
        
        {/* Step 2: Restart Claude Code - CRITICAL */}
        <div className="bg-red-900/20 border border-red-600 rounded-lg p-5 mb-4">
          <h4 className="font-medium mb-3 text-red-400 flex items-center gap-2">
            <span className="bg-red-600 text-white w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold animate-pulse">2</span>
            <FiAlertTriangle className="w-5 h-5" />
            Restart Claude Code (REQUIRED!)
          </h4>
          <div className="bg-red-950/50 border border-red-700 rounded p-4">
            <p className="text-red-300 font-bold mb-3 text-sm">
              ⚠️ This step is MANDATORY - hooks won't work without restart!
            </p>
            <ol className="text-sm text-gray-300 space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-red-400 font-bold">1.</span>
                <span>Close Claude Code completely (Cmd+Q on Mac / Alt+F4 on Windows)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-400 font-bold">2.</span>
                <span>Wait 2-3 seconds</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-400 font-bold">3.</span>
                <span>Reopen Claude Code</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-400 font-bold">4.</span>
                <span>Dashboard status will change from 🔴 Disconnected to 🟢 Connected</span>
              </li>
            </ol>
          </div>
        </div>
        
        {/* Step 3: You're Done! */}
        <div className="bg-green-900/20 border border-green-600 rounded-lg p-5">
          <h4 className="font-medium mb-3 text-green-400 flex items-center gap-2">
            <span className="bg-green-600 text-white w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold">3</span>
            <FiCheckCircle className="w-5 h-5" />
            You're Connected! Start Using Claude Code
          </h4>
          <div className="bg-green-950/30 rounded p-4">
            <p className="text-green-300 font-medium mb-3 text-sm">
              ✅ Dashboard is now tracking everything in real-time:
            </p>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-black/30 rounded p-2">
                <span className="text-gray-400">💬 Every prompt you send</span>
              </div>
              <div className="bg-black/30 rounded p-2">
                <span className="text-gray-400">🔧 All tool usage (Read, Write, Bash)</span>
              </div>
              <div className="bg-black/30 rounded p-2">
                <span className="text-gray-400">📊 Performance metrics</span>
              </div>
              <div className="bg-black/30 rounded p-2">
                <span className="text-gray-400">🤖 Agent activities</span>
              </div>
              <div className="bg-black/30 rounded p-2">
                <span className="text-gray-400">⏱️ Response times</span>
              </div>
              <div className="bg-black/30 rounded p-2">
                <span className="text-gray-400">📈 Event history</span>
              </div>
            </div>
            <div className="mt-4 p-3 bg-yellow-900/20 border border-yellow-600/30 rounded">
              <p className="text-yellow-400 text-xs font-medium">
                ⚡ Keep the terminal running "npx multi-agent-dashboard-connect" open!
              </p>
              <p className="text-yellow-400/70 text-xs mt-1">
                Closing it will stop the dashboard connection
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Visual Status Indicators */}
      <div className="bg-claude-surface rounded-lg border border-claude-border p-5 mb-6">
        <h4 className="font-medium mb-4 text-sm flex items-center gap-2">
          <FiActivity className="w-4 h-4 text-orange-400" />
          Dashboard Connection Status
        </h4>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-red-900/10 border border-red-600/20 rounded p-3 flex items-center gap-3">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            <div>
              <span className="text-red-400 font-medium text-sm">Disconnected</span>
              <p className="text-xs text-gray-500 mt-1">Claude Code needs restart (Step 2)</p>
            </div>
          </div>
          <div className="bg-green-900/10 border border-green-600/20 rounded p-3 flex items-center gap-3">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <div>
              <span className="text-green-400 font-medium text-sm">Connected</span>
              <p className="text-xs text-gray-500 mt-1">Tracking all events in real-time</p>
            </div>
          </div>
        </div>
      </div>

      {/* Agent Installation Section */}
      <div className="bg-claude-surface rounded-lg border border-claude-border p-5 mb-6">
        <h4 className="font-medium mb-4 text-sm flex items-center gap-2">
          <FiPackage className="w-4 h-4 text-orange-400" />
          Installing AI Agents (Optional)
        </h4>
        
        <div className="mb-4">
          <p className="text-sm text-gray-300 mb-3">
            We provide 68 specialized AI agents you can install with simple NPX commands:
          </p>
          
          <div className="bg-black/30 rounded p-3 mb-3">
            <p className="text-xs font-medium text-gray-400 mb-2">Our Agent Commands (68 available):</p>
            <div className="space-y-1">
              {ourAgents.map((cmd, idx) => (
                <div key={idx} className="flex items-center justify-between bg-black/50 rounded px-2 py-1">
                  <code className="text-xs text-green-400 font-mono">{cmd}</code>
                  <button
                    onClick={() => copyToClipboard(cmd, `agent-${idx}`)}
                    className="px-2 py-0.5 bg-orange-600 hover:bg-orange-700 text-white rounded text-xs"
                  >
                    {copiedSection === `agent-${idx}` ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              ))}
              <p className="text-xs text-gray-500 mt-2">...and 64 more agents!</p>
            </div>
          </div>

          <div className="bg-black/30 rounded p-3">
            <p className="text-xs font-medium text-gray-400 mb-2">
              Also Compatible with claude-code-templates from aitmpl.com:
            </p>
            <div className="space-y-1">
              {claudeTemplateAgents.map((cmd, idx) => (
                <div key={idx} className="flex items-center justify-between bg-black/50 rounded px-2 py-1">
                  <code className="text-xs text-blue-400 font-mono">{cmd}</code>
                  <button
                    onClick={() => copyToClipboard(cmd, `template-${idx}`)}
                    className="px-2 py-0.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs"
                  >
                    {copiedSection === `template-${idx}` ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-yellow-900/20 border border-yellow-600/30 rounded p-3 text-xs">
          <p className="text-yellow-400">
            <strong>Note:</strong> Both agent formats work with the dashboard. 
            Agents enhance Claude Code with specialized capabilities for specific tasks.
          </p>
        </div>
      </div>

      {/* Troubleshooting */}
      <div className="bg-claude-surface rounded-lg border border-claude-border p-5">
        <h4 className="font-medium mb-4 text-sm flex items-center gap-2">
          <FiAlertCircle className="w-4 h-4 text-orange-400" />
          Quick Troubleshooting
        </h4>
        <div className="space-y-3">
          <div className="bg-black/30 rounded p-3">
            <p className="text-sm font-medium text-gray-300 mb-2">Dashboard won't start?</p>
            <p className="text-xs text-gray-500 mb-2">Kill any stuck processes first:</p>
            <pre className="bg-black/50 p-2 rounded font-mono text-xs text-green-400">
pkill -f vite; pkill -f "node index.js"
            </pre>
          </div>
          
          <div className="bg-black/30 rounded p-3">
            <p className="text-sm font-medium text-gray-300 mb-2">Still showing "Disconnected"?</p>
            <ul className="text-xs text-gray-500 space-y-1 ml-4">
              <li>• Make sure you restarted Claude Code (Step 2)</li>
              <li>• Check terminal is still running the NPX command</li>
              <li>• Try running: <code className="bg-black/50 px-1 rounded">npx multi-agent-dashboard-connect@latest</code></li>
            </ul>
          </div>
          
          <div className="bg-black/30 rounded p-3">
            <p className="text-sm font-medium text-gray-300 mb-2">Port already in use?</p>
            <pre className="bg-black/50 p-2 rounded font-mono text-xs text-green-400">
lsof -ti:3001 | xargs kill -9
lsof -ti:5174 | xargs kill -9
            </pre>
          </div>
        </div>
      </div>

      {/* Version Info */}
      <div className="mt-6 text-center text-xs text-gray-500">
        <p>Dashboard Connector v3.0.0 • GitHub: <a href="https://github.com/TheAIuniversity/multi-agent-dashboard" target="_blank" rel="noopener noreferrer" className="text-orange-400 hover:underline">TheAIuniversity/multi-agent-dashboard</a></p>
        <p className="mt-1">68 AI Agents Available • Compatible with claude-code-templates</p>
      </div>
    </div>
  );
}

export default AgentSetup;