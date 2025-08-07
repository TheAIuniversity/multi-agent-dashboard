import React, { useState, useRef } from 'react';
import { 
  FiUpload, FiPlus, FiTerminal, FiFolder, FiCpu, FiCode,
  FiTarget, FiList, FiHash, FiX, FiCopy, FiExternalLink,
  FiCalendar, FiActivity, FiGitBranch, FiCheckCircle, FiBook,
  FiInfo
} from 'react-icons/fi';
import { RiRobot2Line } from 'react-icons/ri';
import AgentLibrary from './AgentLibrary';
import AgentBestPractices from './AgentBestPractices';

function AgentManagement({ agents, setAgents }) {
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [importMethod, setImportMethod] = useState('file'); // file, cli
  const [showImportModal, setShowImportModal] = useState(false);
  const [activeTab, setActiveTab] = useState('my-agents'); // my-agents, library, best-practices
  const fileInputRef = useRef(null);

  // Listen for tab switch events
  React.useEffect(() => {
    const handleSwitchToLibrary = () => {
      setActiveTab('library');
    };
    window.addEventListener('switch-to-library-tab', handleSwitchToLibrary);
    return () => {
      window.removeEventListener('switch-to-library-tab', handleSwitchToLibrary);
    };
  }, []);

  // Analyze agent prompt to extract key information
  const analyzeAgentPrompt = (prompt, fileName = '') => {
    const agent = {
      id: Date.now().toString(),
      name: '',
      category: 'Development',
      description: '',
      keyFeatures: [],
      useCases: [],
      prompt: prompt,
      stats: {
        tasksCompleted: 0,
        codeGenerated: 0,
        lastActive: null,
        created: new Date().toISOString()
      }
    };

    // Extract name from filename or prompt
    if (fileName) {
      agent.name = fileName.replace(/\.(txt|md|json)$/i, '').replace(/[-_]/g, ' ');
    } else {
      const nameMatch = prompt.match(/(?:I am|You are|Act as) (?:a |an |the )?([^.]+?)(?:\.|,|who|that)/i);
      if (nameMatch) {
        agent.name = nameMatch[1].trim();
      }
    }

    // Extract description
    const descMatch = prompt.match(/(?:purpose|goal|objective|help|assist)(?:is)?:?\s*([^.]+\.)/i);
    if (descMatch) {
      agent.description = descMatch[1];
    } else {
      agent.description = prompt.split('.')[0] + '.';
    }

    // Extract category
    const categories = {
      'Development': /code|program|develop|build|implement|software|technical/i,
      'Design & UX': /design|ui|ux|interface|visual|layout|style/i,
      'Quality & Testing': /test|qa|quality|bug|debug|verify|validate/i,
      'Operations': /deploy|devops|monitor|infrastructure|system|server/i,
      'Product Strategy': /product|feature|strategy|roadmap|planning|market/i,
      'AI & Innovation': /ai|ml|machine learning|data|algorithm|model/i,
      'Business & Analytics': /business|analytics|metrics|revenue|growth|roi/i
    };

    for (const [cat, regex] of Object.entries(categories)) {
      if (regex.test(prompt)) {
        agent.category = cat;
        break;
      }
    }

    // Extract key features
    const featurePatterns = [
      /(?:features?|capabilities?|can|will|able to)[:.]?\s*([^.]+)/gi,
      /(?:provides?|offers?|includes?)[:.]?\s*([^.]+)/gi,
      /\n[-•*]\s*([^.\n]+)/g
    ];

    featurePatterns.forEach(pattern => {
      const matches = [...prompt.matchAll(pattern)];
      matches.forEach(match => {
        const feature = match[1].trim();
        if (feature.length > 10 && feature.length < 100) {
          agent.keyFeatures.push(feature);
        }
      });
    });

    // Limit features to 6
    agent.keyFeatures = [...new Set(agent.keyFeatures)].slice(0, 6);

    // Extract use cases
    const useCasePatterns = [
      /(?:use cases?|scenarios?|examples?|when to use)[:.]?\s*([^.]+)/gi,
      /(?:perfect for|ideal for|great for)[:.]?\s*([^.]+)/gi
    ];

    useCasePatterns.forEach(pattern => {
      const matches = [...prompt.matchAll(pattern)];
      matches.forEach(match => {
        const useCase = match[1].trim();
        if (useCase.length > 5 && useCase.length < 50) {
          agent.useCases.push(useCase);
        }
      });
    });

    // Limit use cases to 6
    agent.useCases = [...new Set(agent.useCases)].slice(0, 6);

    return agent;
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target.result;
        const newAgent = analyzeAgentPrompt(content, file.name);
        setAgents([...agents, newAgent]);
        setShowImportModal(false);
      };
      reader.readAsText(file);
    }
  };



  const getCategoryIcon = (category) => {
    const icons = {
      'Development': FiCode,
      'Design & UX': FiTarget,
      'Quality & Testing': FiCheckCircle,
      'Operations': FiActivity,
      'Product Strategy': FiGitBranch,
      'AI & Innovation': FiCpu,
      'Business & Analytics': FiActivity
    };
    return icons[category] || FiCode;
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <RiRobot2Line className="w-8 h-8" />
            Agent Management
          </h1>
          {activeTab === 'my-agents' && (
            <button
              onClick={() => setShowImportModal(true)}
              className="px-4 py-2 bg-claude-accent hover:bg-claude-accent-hover text-white rounded-lg flex items-center gap-2 transition-colors"
            >
              <FiPlus className="w-4 h-4" />
              Add Agent
            </button>
          )}
        </div>
        <p className="text-claude-muted">
          Manage your AI agents, view their performance, and track their contributions to your projects.
        </p>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-claude-border">
        <div className="flex gap-6">
          <button
            onClick={() => setActiveTab('my-agents')}
            className={`pb-3 px-1 text-sm font-medium transition-colors relative ${
              activeTab === 'my-agents'
                ? 'text-claude-accent'
                : 'text-claude-muted hover:text-claude-text'
            }`}
          >
            <span className="flex items-center gap-2">
              <FiFolder className="w-4 h-4" />
              My Agents
              {agents.length > 0 && (
                <span className="bg-claude-bg px-2 py-0.5 rounded text-xs">
                  {agents.length}
                </span>
              )}
            </span>
            {activeTab === 'my-agents' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-claude-accent" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('library')}
            className={`pb-3 px-1 text-sm font-medium transition-colors relative ${
              activeTab === 'library'
                ? 'text-claude-accent'
                : 'text-claude-muted hover:text-claude-text'
            }`}
          >
            <span className="flex items-center gap-2">
              <FiBook className="w-4 h-4" />
              Agent Catalog
            </span>
            {activeTab === 'library' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-claude-accent" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('best-practices')}
            className={`pb-3 px-1 text-sm font-medium transition-colors relative ${
              activeTab === 'best-practices'
                ? 'text-claude-accent'
                : 'text-claude-muted hover:text-claude-text'
            }`}
          >
            <span className="flex items-center gap-2">
              <FiInfo className="w-4 h-4" />
              Best Practices
            </span>
            {activeTab === 'best-practices' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-claude-accent" />
            )}
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'my-agents' ? (
        <>
          {/* Agent Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {agents.map((agent) => {
          const CategoryIcon = getCategoryIcon(agent.category);
          return (
            <div
              key={agent.id}
              className="bg-claude-surface border border-claude-border rounded-lg p-6 hover:border-claude-muted transition-all cursor-pointer"
              onClick={() => setSelectedAgent(agent)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-claude-bg rounded-lg flex items-center justify-center">
                    <CategoryIcon className="w-6 h-6 text-claude-accent" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{agent.name || 'Unnamed Agent'}</h3>
                    <span className="text-xs text-claude-muted">{agent.category}</span>
                  </div>
                </div>
              </div>

              <p className="text-sm text-claude-muted mb-4 line-clamp-2">
                {agent.description}
              </p>

              <div className="space-y-3">
                <div>
                  <div className="flex items-center gap-2 text-xs text-claude-muted mb-1">
                    <FiList className="w-3 h-3" />
                    Key Features
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {agent.keyFeatures.slice(0, 3).map((feature, idx) => (
                      <span
                        key={idx}
                        className="text-xs bg-claude-bg px-2 py-1 rounded"
                      >
                        {feature.length > 20 ? feature.substring(0, 20) + '...' : feature}
                      </span>
                    ))}
                    {agent.keyFeatures.length > 3 && (
                      <span className="text-xs text-claude-muted">
                        +{agent.keyFeatures.length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-claude-muted pt-2 border-t border-claude-border">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <FiHash className="w-3 h-3" />
                      {agent.stats.tasksCompleted} tasks
                    </span>
                    <span className="flex items-center gap-1">
                      <FiCode className="w-3 h-3" />
                      {agent.stats.codeGenerated} files
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* Empty State */}
        {agents.length === 0 && (
          <div className="col-span-full text-center py-12">
            <RiRobot2Line className="w-16 h-16 mx-auto text-claude-muted mb-4" />
            <h3 className="text-lg font-semibold mb-2">No agents yet</h3>
            <p className="text-claude-muted mb-4">
              Add your first agent to start tracking their performance
            </p>
            <button
              onClick={() => setShowImportModal(true)}
              className="px-4 py-2 bg-claude-accent hover:bg-claude-accent-hover text-white rounded-lg inline-flex items-center gap-2 transition-colors"
            >
              <FiPlus className="w-4 h-4" />
              Add Agent
            </button>
          </div>
        )}
      </div>

          {/* Import Modal */}
          {showImportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-claude-surface rounded-lg p-6 max-w-lg w-full mx-4 border">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Add New Agent</h2>
              <button
                onClick={() => setShowImportModal(false)}
                className="text-claude-muted hover:text-claude-text"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setImportMethod('file')}
                  className={`p-3 rounded-lg border text-center transition-colors ${
                    importMethod === 'file'
                      ? 'bg-claude-accent text-white border-claude-accent'
                      : 'bg-claude-bg border-claude-border hover:border-claude-muted'
                  }`}
                >
                  <FiFolder className="w-5 h-5 mx-auto mb-1" />
                  <span className="text-xs">File Upload</span>
                </button>
                <button
                  onClick={() => setImportMethod('cli')}
                  className={`p-3 rounded-lg border text-center transition-colors ${
                    importMethod === 'cli'
                      ? 'bg-claude-accent text-white border-claude-accent'
                      : 'bg-claude-bg border-claude-border hover:border-claude-muted'
                  }`}
                >
                  <FiTerminal className="w-5 h-5 mx-auto mb-1" />
                  <span className="text-xs">CLI Import</span>
                </button>
              </div>

              {importMethod === 'file' && (
                <div className="space-y-3">
                  <p className="text-sm text-claude-muted">
                    Upload a text file (.txt, .md) containing your agent prompt
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".txt,.md,.json"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full p-4 border-2 border-dashed border-claude-border rounded-lg hover:border-claude-muted transition-colors flex flex-col items-center gap-2"
                  >
                    <FiUpload className="w-8 h-8 text-claude-muted" />
                    <span className="text-sm text-claude-muted">
                      Click to upload or drag and drop
                    </span>
                  </button>
                </div>
              )}

              {importMethod === 'cli' && (
                <div className="space-y-3">
                  <p className="text-sm text-claude-muted">
                    Use this command to add an agent from your terminal:
                  </p>
                  <div className="bg-claude-bg rounded-lg p-3 font-mono text-sm">
                    <code>npx add-agent --file agent-prompt.txt --dashboard http://localhost:5174</code>
                  </div>
                  <button
                    onClick={() => copyToClipboard('npx add-agent --file agent-prompt.txt --dashboard http://localhost:5174')}
                    className="w-full px-4 py-2 bg-claude-bg hover:bg-claude-border rounded-lg text-sm flex items-center justify-center gap-2 transition-colors"
                  >
                    <FiCopy className="w-4 h-4" />
                    Copy Command
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Agent Detail Modal */}
      {selectedAgent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-claude-surface rounded-lg p-6 max-w-3xl w-full mx-4 border max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-claude-bg rounded-lg flex items-center justify-center">
                  {React.createElement(getCategoryIcon(selectedAgent.category), { className: "w-6 h-6 text-claude-accent" })}
                </div>
                <div>
                  <h2 className="text-2xl font-semibold">{selectedAgent.name}</h2>
                  <span className="text-sm text-claude-muted">{selectedAgent.category}</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedAgent(null)}
                className="text-claude-muted hover:text-claude-text"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-claude-muted">{selectedAgent.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <FiList className="w-4 h-4" />
                    Key Features
                  </h3>
                  <ul className="space-y-2">
                    {selectedAgent.keyFeatures.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm">
                        <span className="text-claude-accent mt-1">•</span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <FiTarget className="w-4 h-4" />
                    Use Cases
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedAgent.useCases.map((useCase, idx) => (
                      <span
                        key={idx}
                        className="text-sm bg-claude-bg px-3 py-1 rounded-full"
                      >
                        {useCase}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <FiActivity className="w-4 h-4" />
                  Performance Stats
                </h3>
                <div className="grid grid-cols-4 gap-4">
                  <div className="bg-claude-bg rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-claude-accent">
                      {selectedAgent.stats.tasksCompleted}
                    </div>
                    <div className="text-xs text-claude-muted">Tasks Completed</div>
                  </div>
                  <div className="bg-claude-bg rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-claude-accent">
                      {selectedAgent.stats.codeGenerated}
                    </div>
                    <div className="text-xs text-claude-muted">Files Generated</div>
                  </div>
                  <div className="bg-claude-bg rounded-lg p-4 text-center">
                    <div className="text-sm font-semibold">
                      {selectedAgent.stats.lastActive ? 
                        new Date(selectedAgent.stats.lastActive).toLocaleDateString() : 
                        'Never'
                      }
                    </div>
                    <div className="text-xs text-claude-muted">Last Active</div>
                  </div>
                  <div className="bg-claude-bg rounded-lg p-4 text-center">
                    <div className="text-sm font-semibold">
                      {new Date(selectedAgent.stats.created).toLocaleDateString()}
                    </div>
                    <div className="text-xs text-claude-muted">Created</div>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold flex items-center gap-2">
                    <FiCode className="w-4 h-4" />
                    Agent Prompt
                  </h3>
                  <button
                    onClick={() => copyToClipboard(selectedAgent.prompt)}
                    className="text-sm text-claude-accent hover:text-claude-accent-hover flex items-center gap-1"
                  >
                    <FiCopy className="w-3 h-3" />
                    Copy Prompt
                  </button>
                </div>
                <div className="bg-claude-bg rounded-lg p-4 font-mono text-sm overflow-x-auto">
                  <pre className="whitespace-pre-wrap">{selectedAgent.prompt}</pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
        </>
      ) : activeTab === 'library' ? (
        <AgentLibrary onAddAgent={(agent) => setAgents([...agents, agent])} />
      ) : (
        <AgentBestPractices />
      )}
    </div>
  );
}

export default AgentManagement;