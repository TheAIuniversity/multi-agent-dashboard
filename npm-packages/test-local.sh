#!/bin/bash

# Test script to verify packages work locally before publishing

echo "🧪 Testing NPM Packages Locally"
echo "================================"
echo ""

# Test main dashboard connector
echo "Testing main dashboard connector..."
cd multi-agent-dashboard-connect
npm link
cd ..
echo "✓ Dashboard connector linked"

# Test a sample agent package
echo ""
echo "Testing sample agent package (ai-engineer)..."
cd "@claude-code/agent-ai-engineer"
npm link
cd ..
echo "✓ Sample agent linked"

# Create test directory
TEST_DIR="/tmp/multi-agent-test-$$"
mkdir -p "$TEST_DIR"
cd "$TEST_DIR"

echo ""
echo "Testing installations in: $TEST_DIR"
echo ""

# Test dashboard connection
echo "Testing dashboard connector..."
if npx multi-agent-dashboard-connect --help > /dev/null 2>&1; then
    echo "✓ Dashboard connector works"
else
    echo "✗ Dashboard connector failed"
fi

# Test agent installation
echo ""
echo "Testing agent installation..."
if npx "@claude-code/agent-ai-engineer" > /dev/null 2>&1; then
    echo "✓ Agent installation works"
else
    echo "✗ Agent installation failed"
fi

# Check if agent file was created
if [ -f ".claude/agents/ai-engineer.md" ]; then
    echo "✓ Agent file created successfully"
else
    echo "✗ Agent file not created"
fi

echo ""
echo "================================"
echo "Local testing complete!"
echo ""
echo "If all tests passed, you can publish with:"
echo "  ./publish-all.sh"
echo ""

# Cleanup
cd ..
rm -rf "$TEST_DIR"