#!/bin/bash

echo "Fixing all agent package.json files..."

for dir in agent-*/; do
  if [ -d "$dir" ]; then
    echo "Fixing $dir"
    
    # Read existing package.json
    pkg_file="$dir/package.json"
    
    # Add "type": "module" after "version" line and bump version
    sed -i '' 's/"version": "1.0.0",/"version": "1.0.1",\n  "type": "module",/' "$pkg_file"
    sed -i '' 's/"version": "1.0.1",/"version": "1.0.1",\n  "type": "module",/' "$pkg_file" 2>/dev/null
    
    echo "  ✓ Updated $dir"
  fi
done

echo "All agent packages fixed!"