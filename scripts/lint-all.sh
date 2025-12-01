#!/bin/bash
set -e

PARENT_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
REPOS=("platform-core" "web-app" "mobile-app" "desktop-app" "ui-kit" "shared-types")

echo "🔍 Linting all ImuChat repositories..."
echo ""

FAILED=()

for repo in "${REPOS[@]}"; do
  REPO_PATH="$PARENT_DIR/$repo"
  if [ -d "$REPO_PATH" ] && [ -f "$REPO_PATH/package.json" ]; then
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "🔍 Linting: $repo"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    cd "$REPO_PATH"
    if pnpm lint 2>/dev/null; then
      echo "✅ $repo lint passed"
    else
      echo "❌ $repo lint failed"
      FAILED+=("$repo")
    fi
    echo ""
  fi
done

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 Lint Summary"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ ${#FAILED[@]} -eq 0 ]; then
  echo "✅ All repos pass linting!"
  exit 0
else
  echo "❌ Failed repos: ${FAILED[*]}"
  exit 1
fi
