#!/bin/bash
set -e

# Get package name and current version
PACKAGE_NAME=$(jq -r .name package.json)
CURRENT_VERSION=$(jq -r .version package.json)

echo "Current version: $CURRENT_VERSION"

# Get new version
TAG_NAME="$PACKAGE_NAME/v$CURRENT_VERSION"

echo $TAG_NAME

# Tag the release
git tag $TAG_NAME

# Push to master & push tag
git push origin $TAG_NAME

echo "Release $CURRENT_VERSION pushed and tagged as $TAG_NAME"