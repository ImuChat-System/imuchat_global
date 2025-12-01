#!/bin/bash
set -e

GITHUB_ORG="ImuChat-System"
REPOS=("platform-core" "web-app" "mobile-app" "desktop-app" "ui-kit" "shared-types" "infra")

# Get the parent directory of imuchat_global
PARENT_DIR="$(cd "$(dirname "$0")/../.." && pwd)"

echo "🚀 Cloning ImuChat repositories to: $PARENT_DIR"
echo ""

cd "$PARENT_DIR"

for repo in "${REPOS[@]}"; do
  if [ -d "$repo" ]; then
    echo "✅ $repo already exists - skipping"
  else
    echo "📦 Cloning $repo..."
    git clone "git@github.com:$GITHUB_ORG/$repo.git" 2>/dev/null || \
    git clone "https://github.com/$GITHUB_ORG/$repo.git" || \
    echo "⚠️  Could not clone $repo - repository may not exist yet"
  fi
done

echo ""
echo "✅ Done! Opening workspace..."
echo "💡 Run: code imuchat_global/ImuChat.code-workspace"
