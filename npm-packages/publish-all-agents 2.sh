#!/bin/bash

echo "Publishing all updated agent packages to NPM..."
echo "This will take a while due to rate limiting. Please be patient."

success_count=0
fail_count=0
failed_packages=""

for dir in agent-*/; do
  if [ -d "$dir" ]; then
    package_name=$(basename "$dir")
    echo ""
    echo "Publishing $package_name (v1.0.1)..."
    
    cd "$dir"
    
    # Try to publish
    if npm publish 2>/dev/null; then
      echo "  ✅ Successfully published $package_name"
      ((success_count++))
    else
      echo "  ❌ Failed to publish $package_name (might be rate limited or already published)"
      ((fail_count++))
      failed_packages="$failed_packages $package_name"
    fi
    
    cd ..
    
    # Add a small delay to avoid rate limiting
    sleep 2
  fi
done

echo ""
echo "======================================="
echo "Publishing Summary:"
echo "  ✅ Successfully published: $success_count packages"
echo "  ❌ Failed: $fail_count packages"

if [ ! -z "$failed_packages" ]; then
  echo ""
  echo "Failed packages (retry these later):"
  echo "$failed_packages"
fi

echo ""
echo "To retry failed packages, wait 2 hours and run this script again."