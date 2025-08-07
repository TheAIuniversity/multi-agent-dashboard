#!/bin/bash

# Multi-Agent Dashboard NPM Publishing Script
# This script publishes all agent packages and the main dashboard connector

set -e  # Exit on error

echo "🚀 Multi-Agent Dashboard NPM Publishing"
echo "========================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if user is logged in to npm
echo "Checking npm login status..."
if ! npm whoami &> /dev/null; then
    echo -e "${RED}Error: Not logged in to npm${NC}"
    echo "Please run 'npm login' first"
    exit 1
fi

NPM_USER=$(npm whoami)
echo -e "${GREEN}✓ Logged in as: $NPM_USER${NC}"
echo ""

# Ask for confirmation
echo -e "${YELLOW}This will publish:${NC}"
echo "  • 1 main dashboard connector package"
echo "  • 68 individual agent packages"
echo ""
read -p "Do you want to continue? (y/N) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Publishing cancelled"
    exit 0
fi

echo ""
echo "Starting publication process..."
echo ""

# Counter for tracking
PUBLISHED=0
FAILED=0

# Publish main dashboard connector
echo "Publishing main dashboard connector..."
if cd "multi-agent-dashboard-connect" && npm publish --access public; then
    echo -e "${GREEN}✓ Published: multi-agent-dashboard-connect${NC}"
    ((PUBLISHED++))
else
    echo -e "${RED}✗ Failed: multi-agent-dashboard-connect${NC}"
    ((FAILED++))
fi
cd ..

echo ""
echo "Publishing individual agents..."
echo ""

# Publish all agent packages
for dir in agent-*; do
    if [ -d "$dir" ]; then
        AGENT_NAME=$(basename "$dir")
        echo "Publishing $AGENT_NAME..."
        
        if cd "$dir" && npm publish --access public; then
            echo -e "${GREEN}✓ Published: $AGENT_NAME${NC}"
            ((PUBLISHED++))
        else
            echo -e "${RED}✗ Failed: $AGENT_NAME${NC}"
            ((FAILED++))
        fi
        cd ..
        
        # Delay to avoid rate limiting
        sleep 2
    fi
done

echo ""
echo "========================================"
echo "Publishing Complete!"
echo ""
echo -e "${GREEN}Successfully published: $PUBLISHED packages${NC}"
if [ $FAILED -gt 0 ]; then
    echo -e "${RED}Failed to publish: $FAILED packages${NC}"
fi

echo ""
echo "Users can now install packages with:"
echo "  npx multi-agent-dashboard-connect"
echo "  npx agent-[agent-id]"
echo ""

# Generate documentation
echo "Generating documentation..."
cat > PUBLISHED_PACKAGES.md << EOF
# Published NPM Packages

## Main Dashboard Connector
\`\`\`bash
npx multi-agent-dashboard-connect
\`\`\`

## Individual Agent Packages
EOF

for dir in agent-*; do
    if [ -d "$dir" ]; then
        AGENT_ID=$(basename "$dir" | sed 's/agent-//')
        echo "- \`npx agent-$AGENT_ID\`" >> PUBLISHED_PACKAGES.md
    fi
done

echo ""
echo -e "${GREEN}✓ Documentation generated: PUBLISHED_PACKAGES.md${NC}"
echo ""
echo "All done! 🎉"