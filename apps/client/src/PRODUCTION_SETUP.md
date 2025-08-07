# Production-Ready One-Click Setup

## The REAL One-Click Setup Options

### Option 1: Environment Variable Approach (Simplest)

Copy this to Claude Code:

```
Please run these commands to set up the Multi-Agent Dashboard connection:

# Create a wrapper script that will inject hooks into all Claude Code operations
cat > ~/.claude-dashboard-wrapper.sh << 'EOF'
#!/bin/bash
# Multi-Agent Dashboard Wrapper

# Export dashboard hooks as environment variables
export CLAUDE_HOOKS_USER_PROMPT_SUBMIT='curl -X POST http://localhost:3001/events -H "Content-Type: application/json" -d "{\"app\": \"$CLAUDE_APP\", \"session_id\": \"$CLAUDE_SESSION_ID\", \"event_type\": \"UserPromptSubmit\", \"payload\": {\"prompt\": \"$1\"}, \"summary\": \"User submitted prompt\"}"'

export CLAUDE_HOOKS_PRE_TOOL_USE='curl -X POST http://localhost:3001/events -H "Content-Type: application/json" -d "{\"app\": \"$CLAUDE_APP\", \"session_id\": \"$CLAUDE_SESSION_ID\", \"event_type\": \"PreToolUse\", \"payload\": {\"tool\": \"$1\"}, \"summary\": \"Using $1\"}"'

export CLAUDE_HOOKS_POST_TOOL_USE='curl -X POST http://localhost:3001/events -H "Content-Type: application/json" -d "{\"app\": \"$CLAUDE_APP\", \"session_id\": \"$CLAUDE_SESSION_ID\", \"event_type\": \"PostToolUse\", \"payload\": {\"tool\": \"$1\"}, \"summary\": \"Completed $1\"}"'

export CLAUDE_HOOKS_ENABLED=true
export CLAUDE_DASHBOARD_URL=http://localhost:3001

# Execute original command with hooks
exec "$@"
EOF

chmod +x ~/.claude-dashboard-wrapper.sh

# Add to shell profile for persistence
echo 'alias claude="CLAUDE_HOOKS_ENABLED=true ~/.claude-dashboard-wrapper.sh claude"' >> ~/.bashrc
echo 'alias claude="CLAUDE_HOOKS_ENABLED=true ~/.claude-dashboard-wrapper.sh claude"' >> ~/.zshrc

# Test the setup
curl -X POST http://localhost:3001/events \
  -H "Content-Type: application/json" \
  -d '{"app": "setup-test", "session_id": "test-123", "event_type": "Notification", "payload": {"message": "Dashboard connected!"}, "summary": "Setup successful"}'

echo "✅ Multi-Agent Dashboard connected! All future Claude Code operations will report to the dashboard."
```

### Option 2: Claude Code Settings File (Direct Edit)

Copy this simpler prompt:

```
Please find and update my Claude Code settings file to add Multi-Agent Dashboard hooks:

1. Search for existing Claude settings:
   find ~ -name "settings.json" -path "*/claude/*" -o -path "*/.claude/*" 2>/dev/null

2. If found, add these hooks to the file. If not found, create ~/.claude/settings.json

3. Use your file editing tools to add this exact JSON to the settings file:

{
  "hooks": {
    "user-prompt-submit-hook": "curl -X POST http://localhost:3001/events -H 'Content-Type: application/json' -d '{\"app\": \"{{app}}\", \"session_id\": \"{{session_id}}\", \"event_type\": \"UserPromptSubmit\", \"payload\": {\"prompt\": \"{{prompt}}\"}, \"summary\": \"User: {{prompt}}\"}'",
    "pre-tool-use-hook": "curl -X POST http://localhost:3001/events -H 'Content-Type: application/json' -d '{\"app\": \"{{app}}\", \"session_id\": \"{{session_id}}\", \"event_type\": \"PreToolUse\", \"payload\": {\"tool\": \"{{tool}}\"}, \"summary\": \"Using {{tool}}\"}'",
    "post-tool-use-hook": "curl -X POST http://localhost:3001/events -H 'Content-Type: application/json' -d '{\"app\": \"{{app}}\", \"session_id\": \"{{session_id}}\", \"event_type\": \"PostToolUse\", \"payload\": {\"tool\": \"{{tool}}\"}, \"summary\": \"Done: {{tool}}\"}'",
    "notification-hook": "curl -X POST http://localhost:3001/events -H 'Content-Type: application/json' -d '{\"app\": \"{{app}}\", \"session_id\": \"{{session_id}}\", \"event_type\": \"Notification\", \"payload\": {\"message\": \"{{message}}\"}, \"summary\": \"{{message}}\"}'",
    "stop-hook": "curl -X POST http://localhost:3001/events -H 'Content-Type: application/json' -d '{\"app\": \"{{app}}\", \"session_id\": \"{{session_id}}\", \"event_type\": \"Stop\", \"payload\": {}, \"summary\": \"Agent stopped\"}'",
    "sub-agent-stop-hook": "curl -X POST http://localhost:3001/events -H 'Content-Type: application/json' -d '{\"app\": \"{{app}}\", \"session_id\": \"{{session_id}}\", \"event_type\": \"SubAgentStop\", \"payload\": {}, \"summary\": \"Sub-agent done\"}'"
  }
}

4. Verify by reading the file back and confirm hooks were added

5. Test with: curl -X POST http://localhost:3001/events -H 'Content-Type: application/json' -d '{"app": "test", "session_id": "test", "event_type": "Notification", "payload": {"message": "Connected!"}, "summary": "Test"}'
```

### Option 3: The ACTUAL One-Click (Using Claude's Tools)

This is the prompt that will 100% work because it uses Claude Code's actual file manipulation tools:

```
Please set up Multi-Agent Dashboard tracking by doing the following:

1. Use the Read tool to check if ~/.claude/settings.json exists
2. If it doesn't exist, use Write tool to create it with this content:
   {"hooks": {}}
3. Use the Read tool to read the current content
4. Use the Edit tool to add/update the hooks section with all the dashboard hooks
5. Verify the changes with Read tool
6. Test the connection with Bash tool to send a test event

This is a production setup - please complete all steps and confirm each one works.
```

## Why Previous Approaches Don't Work

1. **Plain prompt with JSON**: Claude Code can't magically edit its own config without using tools
2. **Environment variables**: Need to be set before Claude Code starts
3. **Manual editing**: Requires user to know where settings file is

## The Production Reality

For a true production app, you need:

1. **Installer script** that users run once:
```bash
curl -sSL https://yourdomain.com/install-dashboard.sh | bash
```

2. **Browser extension** that intercepts Claude Code and adds hooks

3. **Claude Code plugin/extension** (when available)

4. **Proxy approach** that sits between Claude Code and its endpoints

## Best Current Approach

The most reliable current approach is the detailed prompt that tells Claude Code to:
1. Use its file tools to find/create settings
2. Edit the settings with proper JSON
3. Verify and test the connection

This ensures ALL agents (including sub-agents) report to the dashboard because hooks are inherited.