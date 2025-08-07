#!/bin/bash

# Publish packages in small batches to avoid rate limits

echo "📦 Batch Package Publisher"
echo "=========================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Already published packages
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

# Get unpublished packages
UNPUBLISHED=()
for dir in agent-*; do
    if [ -d "$dir" ]; then
        AGENT_NAME=$(basename "$dir")
        if ! is_published "$AGENT_NAME"; then
            UNPUBLISHED+=("$AGENT_NAME")
        fi
    fi
done

echo "Found ${#UNPUBLISHED[@]} unpublished packages"
echo ""

# Ask how many to publish
echo "How many packages do you want to publish in this batch?"
echo "(Recommended: 5-10 to avoid rate limits)"
read -p "Number of packages: " BATCH_SIZE

if ! [[ "$BATCH_SIZE" =~ ^[0-9]+$ ]] || [ "$BATCH_SIZE" -lt 1 ]; then
    echo "Invalid number. Using default of 5."
    BATCH_SIZE=5
fi

echo ""
echo "Publishing $BATCH_SIZE packages..."
echo ""

PUBLISHED=0
FAILED=0

for i in $(seq 0 $((BATCH_SIZE - 1))); do
    if [ $i -ge ${#UNPUBLISHED[@]} ]; then
        break
    fi
    
    AGENT_NAME="${UNPUBLISHED[$i]}"
    echo "Publishing $AGENT_NAME..."
    
    if cd "$AGENT_NAME" && npm publish --access public; then
        echo -e "${GREEN}✓ Published: $AGENT_NAME${NC}"
        ((PUBLISHED++))
    else
        echo -e "${RED}✗ Failed: $AGENT_NAME${NC}"
        ((FAILED++))
        echo "Rate limit hit. Stopping batch."
        break
    fi
    cd ..
    
    # 3 second delay between packages
    sleep 3
done

echo ""
echo "======================================"
echo "Batch Complete!"
echo ""
echo -e "${GREEN}Successfully published: $PUBLISHED packages${NC}"
if [ $FAILED -gt 0 ]; then
    echo -e "${RED}Failed: $FAILED packages${NC}"
    echo ""
    echo "Rate limit detected. Wait 30 minutes before next batch."
fi

REMAINING=$((${#UNPUBLISHED[@]} - PUBLISHED))
echo ""
echo "Remaining unpublished: $REMAINING packages"

if [ $REMAINING -gt 0 ]; then
    echo ""
    echo "To publish next batch, run this script again in 30 minutes."
fi