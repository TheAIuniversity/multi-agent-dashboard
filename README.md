# 🚀 Multi-Agent Dashboard for Claude Code

Real-time observability and monitoring dashboard for Claude Code AI agents. Track, manage, and optimize your AI workforce with comprehensive analytics and insights.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![NPM Version](https://img.shields.io/npm/v/multi-agent-dashboard-connect.svg)
![GitHub Stars](https://img.shields.io/github/stars/TheAIuniversity/multi-agent-dashboard.svg)

## 🎯 Features

- **Real-Time Monitoring**: Live tracking of all Claude Code agent activities
- **Multi-Agent Support**: Monitor 68+ specialized AI agents simultaneously
- **Event Streaming**: WebSocket-based real-time event updates
- **Persistent Storage**: SQLite database for historical data
- **One-Click Setup**: Simple NPX command for instant deployment
- **Global Hooks**: Automatic integration with all Claude Code instances
- **Professional UI**: Modern React dashboard with Tailwind CSS

## 📦 Quick Start

### Install and Run

```bash
npx multi-agent-dashboard-connect
```

That's it! The dashboard will automatically:
- Download from GitHub
- Install dependencies
- Start all servers
- Configure Claude Code hooks
- Open at http://localhost:5174

### Manual Installation

```bash
# Clone the repository
git clone https://github.com/TheAIuniversity/multi-agent-dashboard.git
cd multi-agent-dashboard

# Install dependencies
cd apps/server && npm install
cd ../client && npm install

# Start the dashboard
cd ../server && node index.js &
cd ../client && npm run dev
```

## 🤖 Available AI Agents

Install any specialized agent with a single command:

### Core Development Agents
- `npx agent-ai-engineer` - Full-stack AI development
- `npx agent-backend-architect` - Backend system design
- `npx agent-frontend-developer` - UI/UX implementation
- `npx agent-database-architect` - Database design and optimization
- `npx agent-devops-engineer` - CI/CD and infrastructure

### Testing & Quality
- `npx agent-qa-engineer` - Comprehensive testing
- `npx agent-code-reviewer` - Code quality analysis
- `npx agent-security-auditor` - Security vulnerability scanning
- `npx agent-performance-optimizer` - Performance tuning

### Specialized Agents
- `npx agent-data-scientist` - ML/AI model development
- `npx agent-blockchain-developer` - Web3 and smart contracts
- `npx agent-game-developer` - Game development
- `npx agent-mobile-developer` - iOS/Android apps
- `npx agent-cloud-architect` - Cloud infrastructure

[View all 68 agents →](./npm-packages/AGENTS.md)

## 🏗️ Architecture

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│Claude Code  │────▶│ WebSocket    │────▶│ Dashboard   │
│   Hooks     │     │   Server     │     │     UI      │
└─────────────┘     └──────────────┘     └─────────────┘
                            │
                            ▼
                    ┌──────────────┐
                    │   SQLite     │
                    │   Database   │
                    └──────────────┘
```

## 🔧 Configuration

### Environment Variables

Create `.env` file in `apps/server/`:

```env
PORT=3001
WS_PORT=8766
JWT_SECRET=your-secret-key
NODE_ENV=production
```

### Claude Code Hooks

Hooks are automatically configured in `~/.claude/settings.json`:

```json
{
  "hooks": {
    "UserPromptSubmit": [...],
    "PreToolUse": [...],
    "PostToolUse": [...],
    "Stop": [...]
  }
}
```

## 📊 Dashboard Features

### Real-Time Metrics
- Active sessions tracking
- Tool usage statistics
- Response time monitoring
- Error rate analysis

### Agent Management
- Install/update agents
- View agent capabilities
- Track agent performance
- Manage agent configurations

### Analytics
- Historical data visualization
- Performance trends
- Usage patterns
- Cost optimization insights

## 🔐 Security

- JWT-based authentication
- Secure WebSocket connections
- Input validation and sanitization
- Rate limiting and DDoS protection
- Regular security audits

## 🚀 Deployment

### Production Setup

1. Set environment variables
2. Configure reverse proxy (nginx/Apache)
3. Set up SSL certificates
4. Enable process management (PM2)
5. Configure monitoring (optional)

### Docker Deployment

```bash
docker-compose up -d
```

## 📚 Documentation

- [Installation Guide](./docs/INSTALLATION.md)
- [API Reference](./docs/API.md)
- [Agent Development](./docs/AGENTS.md)
- [Contributing Guide](./CONTRIBUTING.md)
- [Security Policy](./SECURITY.md)

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](./CONTRIBUTING.md) for details.

### Development Setup

```bash
# Fork and clone the repository
git clone https://github.com/YOUR-USERNAME/multi-agent-dashboard.git

# Create a feature branch
git checkout -b feature/your-feature

# Make changes and commit
git commit -m "Add your feature"

# Push and create PR
git push origin feature/your-feature
```

## 📄 License

MIT License - see [LICENSE](./LICENSE) file for details.

## 🙏 Acknowledgments

- Claude Code team at Anthropic
- All contributors and users
- Open source community

## 📞 Support

- [GitHub Issues](https://github.com/TheAIuniversity/multi-agent-dashboard/issues)
- [NPM Package](https://www.npmjs.com/package/multi-agent-dashboard-connect)
- Email: support@theaiuniversity.com

## 🌟 Star History

[![Star History Chart](https://api.star-history.com/svg?repos=TheAIuniversity/multi-agent-dashboard&type=Date)](https://star-history.com/#TheAIuniversity/multi-agent-dashboard&Date)

---

Built with ❤️ by [The AI University](https://github.com/TheAIuniversity)