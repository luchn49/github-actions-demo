#!/bin/bash
set -e

# Get package name and current version
PACKAGE_NAME=$(jq -r .name package.json)
CURRENT_VERSION=$(jq -r .version package.json)

echo "Current version: $CURRENT_VERSION"

# Bump version (choose one: patch, minor, major, or specify version)
VERSION_BUMP=${1:-patch} # default to patch if no argument
npm version $VERSION_BUMP --no-git-tag-version

# Get new version
NEW_VERSION=$(jq -r .version package.json)
TAG_NAME="$PACKAGE_NAME/v$NEW_VERSION"

echo "Bumping version to $NEW_VERSION and tagging as $TAG_NAME"

# Update changelog (assuming you use `git-cliff` or manually update)
echo "## [$NEW_VERSION] - $(date +%Y-%m-%d)" >> CHANGELOG.md
git log --pretty=format:"- %s" "$(git describe --tags --abbrev=0)..HEAD" >> CHANGELOG.md
echo "" >> CHANGELOG.md

# Commit changes
git add package.json CHANGELOG.md
git commit -m "chore(release): $NEW_VERSION"

# Tag the release
git tag $TAG_NAME

# Push to master & push tag
git push origin master
git push origin $TAG_NAME

echo "Release $NEW_VERSION pushed and tagged as $TAG_NAME"