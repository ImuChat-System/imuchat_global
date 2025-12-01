#!/bin/bash
set -e

PARENT_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
REPOS=("platform-core" "web-app" "mobile-app" "desktop-app" "ui-kit" "shared-types")

echo "🧪 Running tests for all ImuChat repositories..."
echo ""

FAILED=()

for repo in "${REPOS[@]}"; do
  REPO_PATH="$PARENT_DIR/$repo"
  if [ -d "$REPO_PATH" ] && [ -f "$REPO_PATH/package.json" ]; then
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "🧪 Testing: $repo"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    cd "$REPO_PATH"
    if pnpm test 2>/dev/null; then
      echo "✅ $repo tests passed"
    else
      echo "❌ $repo tests failed"
      FAILED+=("$repo")
    fi
    echo ""
  fi
done

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 Test Summary"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ ${#FAILED[@]} -eq 0 ]; then
  echo "✅ All tests passed!"
  exit 0
else
  echo "❌ Failed repos: ${FAILED[*]}"
  exit 1
fi
