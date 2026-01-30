#!/bin/bash

# Deployment script for Kids Python Game Platform Enhanced
# This script prepares the enhanced version for GitHub Pages deployment

echo "Preparing enhanced version for deployment..."

# Create a build directory
mkdir -p build

# Copy all files to build directory
cp -r css js *.html *.md *.json build/

# Rename the enhanced index file to index.html for deployment
cp build/index-enhanced.html build/index.html

# Verify the build
echo "Build verification:"
ls -la build/

echo "Deployment files prepared in ./build/ directory"
echo "To deploy to GitHub Pages:"
echo "1. Copy contents of ./build/ to your gh-pages branch"
echo "2. Or upload to your GitHub Pages hosting location"

echo "Enhanced platform ready for deployment!"