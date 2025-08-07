#!/bin/bash

# Script to publish only unpublished packages

echo "🚀 Publishing Remaining Agent Packages"
echo "======================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Already published packages (add to this list)
PUBLISHED_PACKAGES=(
    "multi-agent-dashboard-connect"
    "agent-ai-engineer"
    "agent-ai-penetration-qa"
    "agent-analytics-reporter"
    "agent-anomaly-detector"
    "agent-api-devrel-writer"
    "agent-api-tester"
    "agent-app-store-optimizer"
    "agent-backend-architect"
    "agent-backtesting-engine"
)

# Check if package is already published
is_published() {
    local package=$1
    for published in "${PUBLISHED_PACKAGES[@]}"; do
        if [ "$published" = "$package" ]; then
            return 0
        fi
    done
    return 1
}

# Counter
PUBLISHED=0
SKIPPED=0
FAILED=0

echo "Checking for unpublished packages..."
echo ""

# Process each agent package
for dir in agent-*; do
    if [ -d "$dir" ]; then
        AGENT_NAME=$(basename "$dir")
        
        # Check if already published
        if is_published "$AGENT_NAME"; then
            echo -e "${YELLOW}⊘ Skipping: $AGENT_NAME (already published)${NC}"
            ((SKIPPED++))
        else
            echo "Publishing $AGENT_NAME..."
            
            if cd "$dir" && npm publish --access public; then
                echo -e "${GREEN}✓ Published: $AGENT_NAME${NC}"
                ((PUBLISHED++))
            else
                echo -e "${RED}✗ Failed: $AGENT_NAME${NC}"
                ((FAILED++))
            fi
            cd ..
            
            # Longer delay to avoid rate limiting
            sleep 5
        fi
    fi
done

echo ""
echo "======================================"
echo "Publishing Complete!"
echo ""
echo -e "${GREEN}Successfully published: $PUBLISHED packages${NC}"
echo -e "${YELLOW}Skipped (already published): $SKIPPED packages${NC}"
if [ $FAILED -gt 0 ]; then
    echo -e "${RED}Failed to publish: $FAILED packages${NC}"
fi

echo ""
echo "Total packages that should be live: $((PUBLISHED + SKIPPED))"