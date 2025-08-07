# One-Click Setup for Claude Code

## The Truth About the "One-Click" Setup

The prompt alone won't configure Claude Code automatically. Claude Code needs the actual hook configuration to be added to its settings. Here's what really needs to happen:

### Option 1: Truly One-Click (Recommended)

Copy this single prompt to Claude Code:

```
Please add these hooks to my settings.json file in the Claude Code configuration directory:

{
  "hooks": {
    "user-prompt-submit-hook": "curl -X POST http://localhost:3001/events -H 'Content-Type: application/json' -d '{\"app\": \"{{app}}\", \"session_id\": \"{{session_id}}\", \"event_type\": \"UserPromptSubmit\", \"payload\": {\"prompt\": \"{{prompt}}\"}, \"summary\": \"User submitted prompt\"}'",
    "pre-tool-use-hook": "curl -X POST http://localhost:3001/events -H 'Content-Type: application/json' -d '{\"app\": \"{{app}}\", \"session_id\": \"{{session_id}}\", \"event_type\": \"PreToolUse\", \"payload\": {\"tool\": \"{{tool}}\", \"params\": {{params}}}, \"summary\": \"Using {{tool}}\"}'",
    "post-tool-use-hook": "curl -X POST http://localhost:3001/events -H 'Content-Type: application/json' -d '{\"app\": \"{{app}}\", \"session_id\": \"{{session_id}}\", \"event_type\": \"PostToolUse\", \"payload\": {\"tool\": \"{{tool}}\", \"result\": \"{{result}}\"}, \"summary\": \"Completed {{tool}}\"}'",
    "stop-hook": "curl -X POST http://localhost:3001/events -H 'Content-Type: application/json' -d '{\"app\": \"{{app}}\", \"session_id\": \"{{session_id}}\", \"event_type\": \"Stop\", \"payload\": {}, \"summary\": \"Agent stopped\"}'",
    "notification-hook": "curl -X POST http://localhost:3001/events -H 'Content-Type: application/json' -d '{\"app\": \"{{app}}\", \"session_id\": \"{{session_id}}\", \"event_type\": \"Notification\", \"payload\": {\"message\": \"{{message}}\"}, \"summary\": \"{{message}}\"}'",
    "sub-agent-stop-hook": "curl -X POST http://localhost:3001/events -H 'Content-Type: application/json' -d '{\"app\": \"{{app}}\", \"session_id\": \"{{session_id}}\", \"event_type\": \"SubAgentStop\", \"payload\": {\"agent\": \"{{agent}}\"}, \"summary\": \"Sub-agent {{agent}} completed\"}'",
    "pre-compact-hook": "curl -X POST http://localhost:3001/events -H 'Content-Type: application/json' -d '{\"app\": \"{{app}}\", \"session_id\": \"{{session_id}}\", \"event_type\": \"PreCompact\", \"payload\": {}, \"summary\": \"Compacting context\"}'"
  }
}
```

Claude Code will then add these hooks to your configuration file automatically.

### Option 2: Manual Setup

1. Find your Claude Code settings file (usually `~/.claude/settings.json` or similar)
2. Add the hooks configuration manually
3. Restart Claude Code

### Testing Your Setup

After configuration, test with:

```
Please send a test notification to verify the Multi-Agent Dashboard connection is working.
```

If working, you'll see the event appear in the dashboard immediately.

## Mobile Notifications

The dashboard now supports real mobile push notifications through:

- **Pushover** - $5 one-time fee, most reliable
- **Telegram** - Free, requires bot setup
- **Discord** - Free, webhook-based
- **IFTTT** - Connect to 600+ services

These work even when your browser is closed!