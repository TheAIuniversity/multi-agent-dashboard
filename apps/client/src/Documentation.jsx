import React from 'react';
import { 
  FiBook, FiGithub, FiExternalLink, FiCode, FiUsers, 
  FiTool, FiZap, FiLink, FiFileText, FiInfo
} from 'react-icons/fi';

function Documentation() {
  const sections = [
    {
      title: 'Quick Start & Installation',
      icon: <FiZap className="w-5 h-5" />,
      links: [
        {
          title: 'Dashboard Installation',
          description: 'Get started with npx multi-agent-dashboard-connect@latest',
          url: 'https://github.com/TheAIuniversity/multi-agent-dashboard#quick-start',
          icon: <FiCode className="w-4 h-4" />
        },
        {
          title: 'Agent Installation Guide',
          description: 'How to install and configure all 68 AI agents',
          url: 'https://github.com/TheAIuniversity/multi-agent-dashboard#agents',
          icon: <FiUsers className="w-4 h-4" />
        },
        {
          title: 'Hook Configuration',
          description: 'Understanding how the dashboard hooks work with Claude Code',
          url: 'https://github.com/TheAIuniversity/multi-agent-dashboard#hooks',
          icon: <FiTool className="w-4 h-4" />
        }
      ]
    },
    {
      title: 'Official Anthropic Documentation',
      icon: <FiBook className="w-5 h-5" />,
      links: [
        {
          title: 'Claude Code Documentation',
          description: 'Complete guide to Claude Code features and capabilities',
          url: 'https://www.anthropic.com/claude-code',
          icon: <FiCode className="w-4 h-4" />
        },
        {
          title: 'Hooks Documentation',
          description: 'Learn how to use hooks for event-driven automation',
          url: 'https://docs.anthropic.com/en/docs/claude-code/hooks',
          icon: <FiTool className="w-4 h-4" />
        },
        {
          title: 'Sub-Agents Guide',
          description: 'Master explicit invocation of sub-agents for complex tasks',
          url: 'https://docs.anthropic.com/en/docs/claude-code/sub-agents#explicit-invocation',
          icon: <FiUsers className="w-4 h-4" />
        }
      ]
    },
    {
      title: 'GitHub Resources',
      icon: <FiGithub className="w-5 h-5" />,
      links: [
        {
          title: 'Multi-Agent Dashboard',
          description: 'Official repository for this Multi-Agent Dashboard with 68 AI agents',
          url: 'https://github.com/TheAIuniversity/multi-agent-dashboard',
          icon: <FiZap className="w-4 h-4" />
        },
        {
          title: 'NPM Package - Dashboard Connector',
          description: 'The NPX package that installs and runs this dashboard',
          url: 'https://www.npmjs.com/package/multi-agent-dashboard-connect',
          icon: <FiLink className="w-4 h-4" />
        },
        {
          title: 'Agent Collection',
          description: 'Browse all 68 specialized AI agents on NPM',
          url: 'https://www.npmjs.com/~aiunivesity',
          icon: <FiUsers className="w-4 h-4" />
        }
      ]
    },
    {
      title: 'Quick Start Guides',
      icon: <FiZap className="w-5 h-5" />,
      links: [
        {
          title: 'Getting Started',
          description: 'New to Claude Code? Start here for a complete introduction',
          url: 'https://docs.anthropic.com/en/docs/claude-code/quickstart',
          icon: <FiInfo className="w-4 h-4" />
        },
        {
          title: 'Best Practices',
          description: 'Learn the best practices for building with Claude Code',
          url: 'https://docs.anthropic.com/en/docs/claude-code/best-practices',
          icon: <FiLink className="w-4 h-4" />
        }
      ]
    }
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4 flex items-center gap-3">
          <FiBook className="w-8 h-8 text-claude-accent" />
          Documentation & Resources
        </h1>
        <p className="text-lg text-claude-muted">
          Complete documentation for Multi-Agent Dashboard, 68 AI agents, and Claude Code integration
        </p>
      </div>

      {/* Resource Sections */}
      <div className="space-y-8">
        {sections.map((section, sectionIdx) => (
          <div key={sectionIdx}>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              {section.icon}
              {section.title}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {section.links.map((link, linkIdx) => (
                <a
                  key={linkIdx}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group bg-claude-surface border border-claude-border rounded-lg p-5 hover:border-claude-accent transition-all hover:shadow-lg"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-claude-bg rounded-lg flex items-center justify-center group-hover:bg-claude-accent/10 transition-colors">
                      {link.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1 flex items-center gap-2">
                        {link.title}
                        <FiExternalLink className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </h3>
                      <p className="text-sm text-claude-muted">
                        {link.description}
                      </p>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Documentation;