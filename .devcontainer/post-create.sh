#!/bin/bash
set -e

echo "🚀 ImuChat Dev Container - Post Create Setup"

# Clone repos if they don't exist
REPOS=("platform-core" "web-app" "mobile-app" "desktop-app" "ui-kit" "shared-types" "infra")
GITHUB_ORG="ImuChat-System"

cd /workspace

for repo in "${REPOS[@]}"; do
  if [ ! -d "$repo" ]; then
    echo "📦 Cloning $repo..."
    git clone "https://github.com/$GITHUB_ORG/$repo.git" || echo "⚠️  Could not clone $repo - repo may not exist yet"
  else
    echo "✅ $repo already exists"
  fi
done

# Install dependencies for each repo
echo "📦 Installing dependencies..."
for repo in "${REPOS[@]}"; do
  if [ -d "$repo" ] && [ -f "$repo/package.json" ]; then
    echo "Installing $repo dependencies..."
    cd "$repo"
    pnpm install || true
    cd ..
  fi
done

echo "✅ Dev Container setup complete!"
echo ""
echo "📖 Next steps:"
echo "   1. Open ImuChat.code-workspace"
echo "   2. Run 'pnpm dev' in the app you want to start"
echo "   3. Check DEVELOPER_ONBOARDING.md for more details"
