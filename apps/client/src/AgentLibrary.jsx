import React, { useState } from 'react';
import { 
  FiCode, FiTool, FiServer, FiDatabase, FiLink, FiSmartphone,
  FiZap, FiEye, FiTarget, FiTrendingUp, FiUsers, FiDollarSign,
  FiBarChart, FiLayout, FiPenTool, FiEdit, FiGrid, FiCopy,
  FiX, FiChevronLeft, FiChevronRight, FiLock, FiGlobe, FiBook,
  FiSmile, FiStar, FiCheckSquare, FiPackage, FiShield, FiSearch,
  FiCpu, FiGitBranch, FiMessageSquare, FiDownload, FiAward,
  FiImage, FiActivity, FiFilm, FiHelpCircle, FiPieChart,
  FiGitMerge, FiCheckCircle
} from 'react-icons/fi';
import { agentLibrary, getCategories, searchAgentsByJobRole, smartSearch, getRecommendedAgents } from './agentLibraryData';

// Ensure agentLibrary is loaded
if (!agentLibrary || agentLibrary.length === 0) {
  console.error('AgentLibrary: No agents loaded!');
}

const iconMap = {
  FiCode, FiTool, FiServer, FiDatabase, FiLink, FiSmartphone,
  FiZap, FiEye, FiTarget, FiTrendingUp, FiUsers, FiDollarSign,
  FiBarChart, FiLayout, FiPenTool, FiEdit, FiGrid, FiLock,
  FiGlobe, FiBook, FiSmile, FiStar, FiCheckSquare, FiPackage,
  FiShield, FiCpu, FiGitBranch, FiMessageSquare, FiDownload,
  FiAward, FiImage, FiActivity, FiFilm, FiHelpCircle, FiPieChart,
  FiGitMerge, FiCheckCircle
};

function AgentLibrary({ onAddAgent }) {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');


  // Get categories with counts
  const categoriesData = getCategories().map(category => ({
    name: category,
    count: agentLibrary.filter(agent => agent.category === category).length
  }));
  
  // Add 'All' category
  const categories = [
    { name: 'All', count: agentLibrary.length },
    ...categoriesData
  ];

  // Determine if we're in search mode
  const isSearchMode = searchQuery && searchQuery.trim();

  // Get recommended agents for search
  const recommendations = isSearchMode ? getRecommendedAgents(searchQuery) : null;

  // Filter agents based on search or category
  const filteredAgents = (() => {
    let agents = agentLibrary;
    
    // If searching, use smart search
    if (isSearchMode) {
      agents = smartSearch(searchQuery);
    } else {
      // Otherwise filter by category
      if (selectedCategory !== 'All') {
        agents = agents.filter(agent => agent.category === selectedCategory);
      }
    }
    
    return agents;
  })();

  const getIcon = (iconName) => {
    return iconMap[iconName] || FiCode;
  };

  const copyToClipboard = (text, message = 'Copied to clipboard!') => {
    navigator.clipboard.writeText(text);
    // Show a temporary notification instead of alert
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.className = 'fixed top-4 right-4 bg-orange-600 text-white px-4 py-2 rounded shadow-lg z-50 animate-fade-in';
    document.body.appendChild(notification);
    setTimeout(() => {
      notification.remove();
    }, 2000);
  };

  const addAgentToTeam = (agent) => {
    const newAgent = {
      ...agent,
      id: Date.now().toString(),
      stats: {
        tasksCompleted: 0,
        codeGenerated: 0,
        lastActive: null,
        created: new Date().toISOString()
      }
    };
    onAddAgent(newAgent);
    alert(`${agent.name} added to your team!`);
  };

  return (
    <div className="p-6 max-w-full overflow-x-hidden">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-2">Agent Catalog</h2>
        <p className="text-claude-muted mb-4">
          Browse pre-configured AI agents to enhance your development workflow
        </p>
        {/* Example Searches */}
        <div className="flex flex-wrap gap-2">
          <span className="text-xs text-claude-muted">Try searching:</span>
          {['web design', 'financial app', 'mobile app', 'ecommerce', 'ai chatbot', 'dashboard'].map(example => (
            <button
              key={example}
              onClick={() => setSearchQuery(example)}
              className="text-xs px-2 py-1 bg-claude-surface rounded hover:bg-claude-bg transition-colors text-claude-accent"
            >
              {example}
            </button>
          ))}
        </div>
      </div>

      {/* Smart Search */}
      <div className="mb-6">
        <div className="relative max-w-2xl mx-auto">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search agents or describe your project (e.g., 'web design', 'financial app', 'mobile game', 'ecommerce site'...)"
            className="w-full bg-claude-surface border border-claude-border rounded-lg pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-claude-accent transition-colors"
          />
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-claude-muted" />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-claude-muted hover:text-claude-text"
            >
              <FiX className="w-4 h-4" />
            </button>
          )}
        </div>
        {isSearchMode && (
          <div className="text-center mt-3">
            <p className="text-sm text-claude-muted">
              Found {filteredAgents.length} agent{filteredAgents.length !== 1 ? 's' : ''} for "{searchQuery}"
            </p>
            {recommendations && recommendations.primary.length > 0 && (
              <p className="text-xs text-claude-accent mt-1">
                ✨ Showing best matches for your project
              </p>
            )}
          </div>
        )}
      </div>

      {/* Category Tabs */}
      {!isSearchMode && (
        <div className="mb-6 border-b border-claude-border">
          <div className="flex gap-1 overflow-x-auto pb-px">
            {categories.map((category) => (
              <button
                key={category.name}
                onClick={() => setSelectedCategory(category.name)}
                className={`px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors relative ${
                  selectedCategory === category.name
                    ? 'text-claude-accent'
                    : 'text-claude-muted hover:text-claude-text'
                }`}
              >
              {category.name}
              <span className="ml-2 text-xs bg-claude-bg px-1.5 py-0.5 rounded">
                {category.count}
              </span>
              {selectedCategory === category.name && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-claude-accent" />
              )}
            </button>
          ))}
        </div>
      </div>
      )}

      {/* Info Banner */}
      {!isSearchMode && (
        <div className="mb-6 text-sm text-claude-muted text-center">
          Showing {filteredAgents.length} agents in {selectedCategory}
        </div>
      )}

      {/* Recommendations Section for Search */}
      {isSearchMode && recommendations && recommendations.primary.length > 0 && (
        <div className="mb-8">
          <div className="bg-gradient-to-r from-claude-accent/10 to-transparent rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <FiStar className="w-5 h-5 text-claude-accent" />
                Recommended Agents for "{searchQuery}"
              </h3>
              <button
                onClick={() => {
                  // Add all recommended agents to team
                  const agentsToAdd = recommendations.primary.map((agent, index) => ({
                    ...agent,
                    id: `${Date.now()}-${index}-${Math.random().toString(36).substr(2, 9)}`,
                    stats: {
                      tasksCompleted: 0,
                      codeGenerated: 0,
                      lastActive: null,
                      created: new Date().toISOString()
                    }
                  }));
                  
                  // Add each agent individually to ensure proper state updates
                  agentsToAdd.forEach(agent => {
                    onAddAgent(agent);
                  });
                  
                  alert(`Added ${recommendations.primary.length} recommended agents to your team!`);
                }}
                className="px-4 py-2 bg-claude-accent hover:bg-claude-accent-hover text-white rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
              >
                <FiPackage className="w-4 h-4" />
                Add All to Team
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {recommendations.primary.map((agent, idx) => {
                const Icon = getIcon(agent.icon);
                return (
                  <div
                    key={agent.id}
                    className="bg-claude-surface border-2 border-claude-accent/30 rounded-lg p-4 cursor-pointer hover:border-claude-accent transition-all"
                    onClick={() => setSelectedAgent(agent)}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-claude-accent/20 rounded-lg flex items-center justify-center">
                        <Icon className="w-5 h-5 text-claude-accent" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-sm">{agent.name}</h4>
                          {idx === 0 && (
                            <span className="text-xs bg-claude-accent text-white px-2 py-0.5 rounded">
                              Best Match
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-claude-muted">{agent.category}</p>
                      </div>
                    </div>
                    <p className="text-xs text-claude-muted mb-3 line-clamp-2">
                      {agent.description}
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <code className="flex-1 bg-claude-bg px-2 py-1 rounded text-xs font-mono truncate">
                          {agent.installCommand || `npx agent-${agent.id}`}
                        </code>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            copyToClipboard(agent.installCommand || `npx agent-${agent.id}`, 'Command copied!');
                          }}
                          className="p-1 hover:bg-claude-bg rounded transition-colors"
                        >
                          <FiCopy className="w-3 h-3" />
                        </button>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          addAgentToTeam(agent);
                        }}
                        className="w-full px-2 py-1.5 bg-claude-accent/20 hover:bg-claude-accent/30 text-claude-accent rounded text-xs font-medium transition-colors"
                      >
                        Add to Team
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
            {recommendations.secondary.length > 0 && (
              <div className="mt-4 pt-4 border-t border-claude-border">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-claude-muted">Also consider:</p>
                  <button
                    onClick={() => {
                      // Add all secondary recommended agents to team
                      const agentsToAdd = recommendations.secondary.map((agent, index) => ({
                        ...agent,
                        id: `${Date.now()}-sec-${index}-${Math.random().toString(36).substr(2, 9)}`,
                        stats: {
                          tasksCompleted: 0,
                          codeGenerated: 0,
                          lastActive: null,
                          created: new Date().toISOString()
                        }
                      }));
                      
                      // Add each agent individually to ensure proper state updates
                      agentsToAdd.forEach(agent => {
                        onAddAgent(agent);
                      });
                      
                      alert(`Added ${recommendations.secondary.length} supporting agents to your team!`);
                    }}
                    className="px-3 py-1 bg-claude-surface hover:bg-claude-accent/20 text-claude-accent rounded-full text-xs font-medium transition-colors"
                  >
                    Add All Supporting
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {recommendations.secondary.map(agent => (
                    <button
                      key={agent.id}
                      onClick={() => setSelectedAgent(agent)}
                      className="px-3 py-1 bg-claude-surface rounded-full text-xs hover:bg-claude-bg transition-colors"
                    >
                      {agent.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Agent Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6 max-w-7xl mx-auto">
        {filteredAgents.length === 0 ? (
          <div className="col-span-full text-center py-8 text-claude-muted">
            No agents found. Check console for debug info.
          </div>
        ) : (
          filteredAgents.map((agent) => {
            const Icon = getIcon(agent.icon);
            return (
            <div
              key={agent.id}
              className="bg-claude-surface border border-claude-border rounded-lg p-5 hover:border-orange-600/50 transition-all cursor-pointer"
              onClick={() => setSelectedAgent(agent)}
            >
              <div className="flex items-start gap-2 mb-2">
                <div className="w-8 h-8 bg-claude-bg rounded flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4 h-4 text-claude-accent" />
                </div>
                <div className="flex-1">
                  <div className="text-xs text-claude-muted">{agent.category}</div>
                  <h3 className="font-semibold text-sm">{agent.name}</h3>
                </div>
              </div>
              
              <p className="text-xs text-claude-muted mb-3 line-clamp-2">
                {agent.description}
              </p>

              <div className="space-y-2">
                {/* NPX Install Command */}
                <div className="flex items-center gap-2">
                  <code className="flex-1 bg-claude-bg px-2 py-1 rounded text-xs font-mono truncate min-w-0">
                    {agent.installCommand || `npx agent-${agent.id}`}
                  </code>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      copyToClipboard(agent.installCommand || `npx agent-${agent.id}`, 'Install command copied!');
                    }}
                    className="p-1.5 hover:bg-claude-bg rounded transition-colors flex-shrink-0"
                    title="Copy install command"
                  >
                    <FiCopy className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    addAgentToTeam(agent);
                  }}
                  className="w-full px-3 py-2 bg-claude-bg hover:bg-claude-border rounded text-xs transition-colors mt-2"
                >
                  Add to My Agents
                </button>
              </div>
            </div>
          );
        })
        )}
      </div>

      {/* Agent Detail Modal */}
      {selectedAgent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-claude-surface rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="border-b border-claude-border p-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setSelectedAgent(null)}
                  className="p-2 hover:bg-claude-bg rounded transition-colors"
                >
                  <FiChevronLeft className="w-5 h-5" />
                </button>
                <div className="w-12 h-12 bg-claude-bg rounded-lg flex items-center justify-center">
                  {React.createElement(getIcon(selectedAgent.icon), { className: "w-6 h-6 text-claude-accent" })}
                </div>
                <div>
                  <div className="text-sm text-claude-muted">{selectedAgent.category}</div>
                  <h2 className="text-2xl font-semibold">{selectedAgent.name}</h2>
                </div>
              </div>
              <button
                onClick={() => setSelectedAgent(null)}
                className="p-2 hover:bg-claude-bg rounded transition-colors"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-6">
                {/* Description */}
                <div>
                  <p className="text-lg text-claude-muted">{selectedAgent.description}</p>
                </div>

                {/* Key Features */}
                <div>
                  <h3 className="font-semibold text-lg mb-3">Key Features</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {selectedAgent.keyFeatures.map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <span className="text-claude-accent">•</span>
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Use Cases */}
                <div>
                  <h3 className="font-semibold text-lg mb-3">Use Cases</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedAgent.useCases.map((useCase, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-claude-bg rounded-full text-sm"
                      >
                        {useCase}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Installation */}
                <div>
                  <h3 className="font-semibold text-lg mb-3">Quick Install</h3>
                  <div className="bg-claude-bg rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <code className="flex-1 font-mono text-sm">
                        {selectedAgent.installCommand || `npx agent-${selectedAgent.id}`}
                      </code>
                      <button
                        onClick={() => copyToClipboard(selectedAgent.installCommand || `npx agent-${selectedAgent.id}`, 'Install command copied!')}
                        className="px-3 py-1.5 bg-claude-accent hover:bg-claude-accent-hover text-white rounded text-sm flex items-center gap-2 transition-colors"
                      >
                        <FiCopy className="w-3.5 h-3.5" />
                        Copy
                      </button>
                    </div>
                    <p className="text-xs text-claude-muted mt-3">
                      This command will install the agent as a Claude Code sub-agent and connect it to your dashboard
                    </p>
                  </div>
                </div>

                {/* Agent Prompt */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-lg">Agent Prompt</h3>
                    <button
                      onClick={() => copyToClipboard(selectedAgent.prompt)}
                      className="px-3 py-1.5 bg-claude-accent hover:bg-claude-accent-hover text-white rounded text-sm flex items-center gap-2 transition-colors"
                    >
                      <FiCopy className="w-3.5 h-3.5" />
                      Copy Prompt
                    </button>
                  </div>
                  <div className="bg-claude-bg rounded-lg p-4">
                    <pre className="whitespace-pre-wrap text-sm font-mono">{selectedAgent.prompt}</pre>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="border-t border-claude-border p-6">
              <button
                onClick={() => {
                  addAgentToTeam(selectedAgent);
                  setSelectedAgent(null);
                }}
                className="w-full px-4 py-3 bg-claude-accent hover:bg-claude-accent-hover text-white rounded-lg font-medium transition-colors"
              >
                Add {selectedAgent.name} to Team
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AgentLibrary;