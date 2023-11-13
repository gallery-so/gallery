#!/bin/bash

# The path to your app.config.ts file
FILE="app.config.ts"

# Extract the current version number
current_version=$(grep "version:" $FILE | sed -E "s/.*'([0-9]+\.[0-9]+\.[0-9]+)'.*/\1/")

# Break the version number into an array (major.minor.patch)
IFS='.' read -r -a version_parts <<< "$current_version"

# Increment the patch version
patch_version=$((version_parts[2]+1))

# Construct the new version number
new_version="${version_parts[0]}.${version_parts[1]}.$patch_version"

# Replace the version number in the file
sed -i '' "s/version: '${version_parts[0]}\.${version_parts[1]}\.${version_parts[2]}'/version: '${new_version}'/" $FILE

echo "Version updated to $new_version"

# Git operations
# Make sure you are in the repository directory or adjust these commands accordingly

# Create a new branch with the new version name
git checkout -b $new_version

# Add the changed file
git add $FILE

# Commit the changes with a message
git commit -m "Incremented version number to $new_version"

# Push the branch to the remote repository
# git push origin $new_version

echo "Git operations completed: branch $new_version created and pushed"
