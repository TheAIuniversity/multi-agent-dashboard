#!/bin/bash

echo "🤖 Multi-Agent Dashboard - Haiku API Setup"
echo "=========================================="
echo ""
echo "This script will configure Haiku 3.5 API for AI task summaries."
echo "The API key will be stored securely on your server only."
echo "All dashboard users will benefit from AI summaries without seeing the key."
echo ""

# Check if .env file exists
ENV_FILE="apps/server/.env"

if [ ! -f "$ENV_FILE" ]; then
  echo "Creating .env file from example..."
  cp apps/server/.env.example "$ENV_FILE"
fi

# Ask for API key
echo "Please enter your Anthropic API key for Haiku 3.5:"
echo "(Get your key from https://console.anthropic.com/)"
read -s API_KEY

# Update .env file
if grep -q "ANTHROPIC_API_KEY=" "$ENV_FILE"; then
  # Update existing key
  sed -i '' "s/ANTHROPIC_API_KEY=.*/ANTHROPIC_API_KEY=$API_KEY/" "$ENV_FILE"
else
  # Add new key
  echo "" >> "$ENV_FILE"
  echo "# Anthropic API for Task Summaries (Haiku 3.5)" >> "$ENV_FILE"
  echo "ANTHROPIC_API_KEY=$API_KEY" >> "$ENV_FILE"
fi

echo ""
echo "✅ API key configured successfully!"
echo ""
echo "Features enabled:"
echo "  • AI-generated summaries when tasks complete"
echo "  • Plain English explanations of what was done"
echo "  • Automatic summary generation for all users"
echo "  • Secure server-side key storage"
echo ""
echo "To start the dashboard with AI summaries:"
echo "  npx multi-agent-dashboard-connect@latest"
echo ""