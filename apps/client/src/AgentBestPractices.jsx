import React, { useState } from 'react';
import { 
  FiBook, FiUsers, FiTarget, FiZap, FiCode, FiTool,
  FiSettings, FiBarChart, FiCheckCircle, FiLayers,
  FiFolder, FiUser, FiChevronDown, FiChevronRight,
  FiCopy, FiX, FiBookOpen, FiTrendingUp, FiGitBranch
} from 'react-icons/fi';

function AgentBestPractices() {
  const [expandedSections, setExpandedSections] = useState({
    general: true,
    technical: false,
    performance: false,
    customization: false,
    departments: false,
    fileStructure: false
  });

  const [selectedCodeExample, setSelectedCodeExample] = useState(null);

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('Code copied to clipboard!');
  };

  const codeExamples = {
    agentStructure: `---
name: senior-developer
description: Senior Full-Stack Developer - Expert in architecture and code quality
tools: Read, Write, Edit, Bash, WebSearch
model: sonnet
---

# Senior Full-Stack Developer Agent

You are a senior full-stack developer with 8+ years of experience.

## Your Expertise
- React, Next.js, TypeScript for frontend
- Node.js, Python, Go for backend
- AWS, Docker, Kubernetes for infrastructure
- System design and architecture

## How You Work
1. Always review existing code patterns first
2. Write clean, maintainable, well-documented code
3. Consider performance and scalability
4. Follow security best practices
5. Use appropriate design patterns

## Response Format
End responses with: "Development task complete. [Summary of what was built/fixed]"`,
    fileStructure: `your-project/
├── .claude/
│   └── agents/
│       ├── backend-developer.md
│       ├── frontend-specialist.md
│       ├── database-expert.md
│       ├── devops-engineer.md
│       └── qa-automation.md
├── apps/
│   ├── client/        # Dashboard UI
│   └── server/        # Backend API
├── src/
│   └── your-code/
└── package.json

# Agent files use YAML frontmatter + markdown
# Stored in .claude/agents/ directory
# Auto-discovered by Claude Code`,
    customAgent: `# Creating a Custom Agent in Claude Code

## Step 1: Create agent file
# Save as: .claude/agents/ethics-specialist.md

---
name: ethics-specialist
description: AI Ethics Specialist - Ensures responsible AI development
tools: Read, WebSearch, Task
model: haiku
---

# AI Ethics Specialist

You are an AI ethics specialist focused on responsible AI development.

## Key Responsibilities
- Review AI implementations for ethical considerations
- Identify potential biases in algorithms and data
- Ensure compliance with privacy regulations
- Provide guidance on responsible AI practices

## Core Principles
- Fairness and non-discrimination
- Transparency and explainability
- Privacy and data protection
- Human oversight and accountability

## Step 2: Use in Claude Code
# The agent is auto-discovered and can be triggered by mentioning
# ethics, bias, privacy, or compliance in your requests`
  };

  const bestPractices = {
    general: [
      {
        title: "Leverage Claude Code's Agent System",
        icon: FiUsers,
        description: "Claude Code automatically delegates to specialized agents based on your task.",
        tips: [
          "Agents are auto-triggered by keywords in your requests",
          "Each agent has specific tools and expertise areas",
          "Agents work in isolated contexts for focused results",
          "Use descriptive task names to trigger the right agent"
        ]
      },
      {
        title: "Be Specific About What You Want",
        icon: FiTarget,
        description: "Clear, detailed requirements lead to better outcomes. Avoid ambiguous requests.",
        tips: [
          "Provide concrete examples of desired outcomes",
          "Specify technical constraints and requirements",
          "Include acceptance criteria for tasks",
          "Reference existing code or designs when relevant"
        ]
      },
      {
        title: "Create Project-Specific Agents",
        icon: FiCheckCircle,
        description: "Store custom agents in .claude/agents/ for your project needs.",
        tips: [
          "Agents are markdown files with YAML frontmatter",
          "Define specific tools each agent can access",
          "Choose appropriate models (haiku/sonnet/opus) based on complexity",
          "Agents are automatically discovered by Claude Code"
        ]
      },
      {
        title: "Monitor with the Dashboard",
        icon: FiZap,
        description: "Use this dashboard to track all agent activities in real-time.",
        tips: [
          "View all tool usage and agent delegations",
          "Track performance metrics for optimization",
          "Monitor which agents are triggered most often",
          "Analyze patterns to improve agent prompts"
        ]
      }
    ],
    technical: [
      {
        title: "Agent File Structure",
        description: "Agents use YAML frontmatter with markdown for Claude Code integration.",
        details: [
          "name: Unique identifier (lowercase, hyphens)",
          "description: Brief description with trigger keywords",
          "tools: Comma-separated list of allowed tools",
          "model: Choose haiku, sonnet, or opus",
          "Markdown body contains the system prompt",
          "Store in .claude/agents/ directory"
        ]
      },
      {
        title: "Creating New Agents",
        description: "Steps to add custom agents to your Claude Code setup.",
        details: [
          "Create .claude/agents/ directory in your project",
          "Write agent file with YAML frontmatter + markdown",
          "Include trigger keywords in description for auto-delegation",
          "Specify minimal necessary tools for security",
          "Test agent with sample requests in Claude Code",
          "Monitor performance via this dashboard"
        ]
      }
    ],
    performance: [
      {
        title: "Key Metrics to Track",
        metrics: [
          { name: "Tasks Completed", description: "Total number of tasks successfully finished", icon: FiCheckCircle },
          { name: "Code Generated", description: "Lines of code or components created", icon: FiCode },
          { name: "Response Time", description: "Average time to complete tasks", icon: FiZap },
          { name: "Quality Score", description: "Peer review ratings and user satisfaction", icon: FiTrendingUp },
          { name: "Collaboration Rate", description: "Frequency of inter-agent interactions", icon: FiUsers },
          { name: "Learning Progress", description: "Improvement in performance over time", icon: FiBookOpen }
        ]
      }
    ],
    departments: [
      {
        name: "Backend Development",
        icon: FiCode,
        guidelines: [
          "Use appropriate backend agents for API work",
          "Agents should handle database operations safely",
          "Include error handling in agent prompts",
          "Grant database tools only when necessary",
          "Monitor API performance via dashboard"
        ]
      },
      {
        name: "Frontend Development",
        icon: FiLayers,
        guidelines: [
          "Frontend agents focus on UI/UX",
          "Include React/Vue/Angular expertise as needed",
          "Agents should follow component patterns",
          "Test UI changes before deployment",
          "Track component generation metrics"
        ]
      },
      {
        name: "DevOps & Infrastructure",
        icon: FiTarget,
        guidelines: [
          "DevOps agents need Bash and system tools",
          "Include Docker/K8s knowledge in prompts",
          "Restrict production access appropriately",
          "Monitor deployment success rates",
          "Track infrastructure changes via dashboard"
        ]
      },
      {
        name: "Testing & QA",
        icon: FiTrendingUp,
        guidelines: [
          "QA agents should write comprehensive tests",
          "Include test framework expertise",
          "Agents can run but not skip tests",
          "Track test coverage improvements",
          "Monitor bug detection rates"
        ]
      }
    ]
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-claude-bg rounded-lg flex items-center justify-center">
            <FiBook className="w-6 h-6 text-claude-accent" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Agent Best Practices</h1>
            <p className="text-claude-muted">Comprehensive guide to using and customizing AI agents effectively</p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-claude-surface border border-claude-border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <FiUsers className="w-4 h-4 text-claude-accent" />
            <span className="text-sm font-medium">Team Collaboration</span>
          </div>
          <p className="text-xs text-claude-muted">Foster effective agent cooperation</p>
        </div>
        <div className="bg-claude-surface border border-claude-border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <FiSettings className="w-4 h-4 text-claude-accent" />
            <span className="text-sm font-medium">Customization</span>
          </div>
          <p className="text-xs text-claude-muted">Tailor agents to your needs</p>
        </div>
        <div className="bg-claude-surface border border-claude-border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <FiBarChart className="w-4 h-4 text-claude-accent" />
            <span className="text-sm font-medium">Performance</span>
          </div>
          <p className="text-xs text-claude-muted">Track and optimize results</p>
        </div>
        <div className="bg-claude-surface border border-claude-border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <FiTool className="w-4 h-4 text-claude-accent" />
            <span className="text-sm font-medium">Best Practices</span>
          </div>
          <p className="text-xs text-claude-muted">Proven strategies for success</p>
        </div>
      </div>

      {/* General Best Practices */}
      <div className="mb-6">
        <button
          onClick={() => toggleSection('general')}
          className="w-full flex items-center justify-between p-4 bg-claude-surface border border-claude-border rounded-lg hover:border-claude-muted transition-colors"
        >
          <div className="flex items-center gap-3">
            <FiUsers className="w-5 h-5 text-claude-accent" />
            <h2 className="text-xl font-semibold">General Best Practices</h2>
          </div>
          {expandedSections.general ? <FiChevronDown /> : <FiChevronRight />}
        </button>
        
        {expandedSections.general && (
          <div className="mt-4 space-y-4">
            {bestPractices.general.map((practice, idx) => {
              const Icon = practice.icon;
              return (
                <div key={idx} className="bg-claude-surface border border-claude-border rounded-lg p-5">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-claude-bg rounded-lg flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5 text-claude-accent" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-2">{practice.title}</h3>
                      <p className="text-claude-muted mb-4">{practice.description}</p>
                      <div className="space-y-2">
                        {practice.tips.map((tip, tipIdx) => (
                          <div key={tipIdx} className="flex items-start gap-2">
                            <span className="text-claude-accent text-sm mt-1">•</span>
                            <span className="text-sm">{tip}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Technical Details */}
      <div className="mb-6">
        <button
          onClick={() => toggleSection('technical')}
          className="w-full flex items-center justify-between p-4 bg-claude-surface border border-claude-border rounded-lg hover:border-claude-muted transition-colors"
        >
          <div className="flex items-center gap-3">
            <FiCode className="w-5 h-5 text-claude-accent" />
            <h2 className="text-xl font-semibold">Technical Details</h2>
          </div>
          {expandedSections.technical ? <FiChevronDown /> : <FiChevronRight />}
        </button>
        
        {expandedSections.technical && (
          <div className="mt-4 space-y-4">
            {bestPractices.technical.map((item, idx) => (
              <div key={idx} className="bg-claude-surface border border-claude-border rounded-lg p-5">
                <h3 className="font-semibold text-lg mb-3">{item.title}</h3>
                <p className="text-claude-muted mb-4">{item.description}</p>
                <div className="space-y-2">
                  {item.details.map((detail, detailIdx) => (
                    <div key={detailIdx} className="flex items-start gap-2">
                      <span className="text-claude-accent text-sm mt-1">•</span>
                      <span className="text-sm">{detail}</span>
                    </div>
                  ))}
                </div>
                {idx === 0 && (
                  <button
                    onClick={() => setSelectedCodeExample('agentStructure')}
                    className="mt-4 px-3 py-2 bg-claude-bg hover:bg-claude-border rounded text-sm transition-colors flex items-center gap-2"
                  >
                    <FiCode className="w-4 h-4" />
                    View Agent Structure Example
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Performance Tracking */}
      <div className="mb-6">
        <button
          onClick={() => toggleSection('performance')}
          className="w-full flex items-center justify-between p-4 bg-claude-surface border border-claude-border rounded-lg hover:border-claude-muted transition-colors"
        >
          <div className="flex items-center gap-3">
            <FiBarChart className="w-5 h-5 text-claude-accent" />
            <h2 className="text-xl font-semibold">Performance Tracking</h2>
          </div>
          {expandedSections.performance ? <FiChevronDown /> : <FiChevronRight />}
        </button>
        
        {expandedSections.performance && (
          <div className="mt-4">
            <div className="bg-claude-surface border border-claude-border rounded-lg p-5">
              <h3 className="font-semibold text-lg mb-4">Key Metrics to Track</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {bestPractices.performance[0].metrics.map((metric, idx) => {
                  const Icon = metric.icon;
                  return (
                    <div key={idx} className="flex items-start gap-3 p-3 bg-claude-bg rounded-lg">
                      <Icon className="w-5 h-5 text-claude-accent mt-0.5" />
                      <div>
                        <h4 className="font-medium">{metric.name}</h4>
                        <p className="text-sm text-claude-muted">{metric.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Customization Guide */}
      <div className="mb-6">
        <button
          onClick={() => toggleSection('customization')}
          className="w-full flex items-center justify-between p-4 bg-claude-surface border border-claude-border rounded-lg hover:border-claude-muted transition-colors"
        >
          <div className="flex items-center gap-3">
            <FiSettings className="w-5 h-5 text-claude-accent" />
            <h2 className="text-xl font-semibold">Customization Guide</h2>
          </div>
          {expandedSections.customization ? <FiChevronDown /> : <FiChevronRight />}
        </button>
        
        {expandedSections.customization && (
          <div className="mt-4 space-y-4">
            <div className="bg-claude-surface border border-claude-border rounded-lg p-5">
              <h3 className="font-semibold text-lg mb-4">Creating Custom Agents</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-claude-accent text-white rounded-full flex items-center justify-center text-xs font-bold">1</div>
                  <div>
                    <h4 className="font-medium">Define Role & Responsibilities</h4>
                    <p className="text-sm text-claude-muted">Clearly outline what the agent should do and their expertise areas</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-claude-accent text-white rounded-full flex items-center justify-center text-xs font-bold">2</div>
                  <div>
                    <h4 className="font-medium">Write Comprehensive Prompts</h4>
                    <p className="text-sm text-claude-muted">Include context, examples, and specific guidelines for behavior</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-claude-accent text-white rounded-full flex items-center justify-center text-xs font-bold">3</div>
                  <div>
                    <h4 className="font-medium">Test & Iterate</h4>
                    <p className="text-sm text-claude-muted">Start with simple tasks and refine based on performance</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-claude-accent text-white rounded-full flex items-center justify-center text-xs font-bold">4</div>
                  <div>
                    <h4 className="font-medium">Integrate with Team</h4>
                    <p className="text-sm text-claude-muted">Establish workflows and handoff points with other agents</p>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedCodeExample('customAgent')}
                className="mt-4 px-3 py-2 bg-claude-accent hover:bg-claude-accent-hover text-white rounded text-sm transition-colors flex items-center gap-2"
              >
                <FiCode className="w-4 h-4" />
                View Custom Agent Example
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Department Guidelines */}
      <div className="mb-6">
        <button
          onClick={() => toggleSection('departments')}
          className="w-full flex items-center justify-between p-4 bg-claude-surface border border-claude-border rounded-lg hover:border-claude-muted transition-colors"
        >
          <div className="flex items-center gap-3">
            <FiUser className="w-5 h-5 text-claude-accent" />
            <h2 className="text-xl font-semibold">Department-Specific Guidelines</h2>
          </div>
          {expandedSections.departments ? <FiChevronDown /> : <FiChevronRight />}
        </button>
        
        {expandedSections.departments && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            {bestPractices.departments.map((dept, idx) => {
              const Icon = dept.icon;
              return (
                <div key={idx} className="bg-claude-surface border border-claude-border rounded-lg p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <Icon className="w-5 h-5 text-claude-accent" />
                    <h3 className="font-semibold text-lg">{dept.name}</h3>
                  </div>
                  <div className="space-y-2">
                    {dept.guidelines.map((guideline, guideIdx) => (
                      <div key={guideIdx} className="flex items-start gap-2">
                        <span className="text-claude-accent text-sm mt-1">•</span>
                        <span className="text-sm">{guideline}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* File Structure Templates */}
      <div className="mb-6">
        <button
          onClick={() => toggleSection('fileStructure')}
          className="w-full flex items-center justify-between p-4 bg-claude-surface border border-claude-border rounded-lg hover:border-claude-muted transition-colors"
        >
          <div className="flex items-center gap-3">
            <FiFolder className="w-5 h-5 text-claude-accent" />
            <h2 className="text-xl font-semibold">File Structure Templates</h2>
          </div>
          {expandedSections.fileStructure ? <FiChevronDown /> : <FiChevronRight />}
        </button>
        
        {expandedSections.fileStructure && (
          <div className="mt-4">
            <div className="bg-claude-surface border border-claude-border rounded-lg p-5">
              <h3 className="font-semibold text-lg mb-4">Recommended Project Structure</h3>
              <p className="text-claude-muted mb-4">
                Organize your agents and templates using this recommended file structure for better maintainability.
              </p>
              <button
                onClick={() => setSelectedCodeExample('fileStructure')}
                className="px-3 py-2 bg-claude-bg hover:bg-claude-border rounded text-sm transition-colors flex items-center gap-2"
              >
                <FiGitBranch className="w-4 h-4" />
                View File Structure
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Code Example Modal */}
      {selectedCodeExample && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-claude-surface rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="border-b border-claude-border p-6 flex items-center justify-between">
              <h3 className="text-xl font-semibold">
                {selectedCodeExample === 'agentStructure' && 'Agent Structure Example'}
                {selectedCodeExample === 'fileStructure' && 'File Structure Template'}
                {selectedCodeExample === 'customAgent' && 'Custom Agent Example'}
              </h3>
              <button
                onClick={() => setSelectedCodeExample(null)}
                className="p-2 hover:bg-claude-bg rounded transition-colors"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-claude-muted">
                  {selectedCodeExample === 'agentStructure' && 'JSON structure for defining agents'}
                  {selectedCodeExample === 'fileStructure' && 'Recommended directory organization'}
                  {selectedCodeExample === 'customAgent' && 'JavaScript code for creating custom agents'}
                </span>
                <button
                  onClick={() => copyToClipboard(codeExamples[selectedCodeExample])}
                  className="px-3 py-1.5 bg-claude-accent hover:bg-claude-accent-hover text-white rounded text-sm flex items-center gap-2 transition-colors"
                >
                  <FiCopy className="w-3.5 h-3.5" />
                  Copy Code
                </button>
              </div>
              <div className="bg-claude-bg rounded-lg p-4 overflow-x-auto">
                <pre className="text-sm font-mono whitespace-pre-wrap">
                  {codeExamples[selectedCodeExample]}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AgentBestPractices;