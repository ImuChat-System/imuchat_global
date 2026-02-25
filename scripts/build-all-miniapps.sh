#!/usr/bin/env bash
# =============================================================================
# build-all-miniapps.sh
# Build et déploie toutes les mini-apps dans web-app/public/miniapps/
#
# Usage :
#   bash scripts/build-all-miniapps.sh          # build toutes les mini-apps
#   bash scripts/build-all-miniapps.sh imu-games imu-voom   # build seulement celles spécifiées
#   SKIP_INSTALL=1 bash scripts/build-all-miniapps.sh       # skip pnpm install
# =============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
OUTPUT_DIR="$ROOT_DIR/web-app/public/miniapps"

# Toutes les mini-apps (Phase A + Phase B)
ALL_MINIAPPS=(
  imu-games
  imu-voom
  imu-resources
  imu-worlds
  imu-contests
  imu-dating
  imu-smart-home
  imu-mobility
  imu-style-beauty
  imu-sports
  imu-formations
  imu-finance
  imu-library
  imu-services
)

# Si des arguments sont passés, ne builder que celles-là
if [[ $# -gt 0 ]]; then
  MINIAPPS=("$@")
else
  MINIAPPS=("${ALL_MINIAPPS[@]}")
fi

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔══════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║       🏗️  ImuChat Mini-Apps Build Pipeline          ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "  📦 Mini-apps à builder : ${#MINIAPPS[@]}"
echo -e "  📂 Output : $OUTPUT_DIR"
echo ""

# Installer les dépendances si nécessaire
if [[ "${SKIP_INSTALL:-}" != "1" ]]; then
  echo -e "${YELLOW}▶ Installation des dépendances (pnpm install)...${NC}"
  cd "$ROOT_DIR"
  pnpm install --frozen-lockfile 2>/dev/null || pnpm install
  echo ""
fi

# Créer le dossier de sortie
mkdir -p "$OUTPUT_DIR"

# Compteurs
SUCCESS=0
FAILED=0
SKIPPED=0
FAILED_LIST=()

# Builder chaque mini-app
for MINIAPP in "${MINIAPPS[@]}"; do
  MINIAPP_DIR="$ROOT_DIR/$MINIAPP"

  if [[ ! -d "$MINIAPP_DIR" ]]; then
    echo -e "${YELLOW}⚠ $MINIAPP : répertoire introuvable — SKIPPED${NC}"
    ((SKIPPED++))
    continue
  fi

  if [[ ! -f "$MINIAPP_DIR/package.json" ]]; then
    echo -e "${YELLOW}⚠ $MINIAPP : pas de package.json — SKIPPED${NC}"
    ((SKIPPED++))
    continue
  fi

  echo -e "${BLUE}▶ Building ${MINIAPP}...${NC}"

  cd "$MINIAPP_DIR"

  if pnpm run deploy:local 2>&1 | tail -5; then
    echo -e "${GREEN}  ✓ ${MINIAPP} — build OK${NC}"
    ((SUCCESS++))
  else
    echo -e "${RED}  ✗ ${MINIAPP} — build FAILED${NC}"
    ((FAILED++))
    FAILED_LIST+=("$MINIAPP")
  fi

  echo ""
done

cd "$ROOT_DIR"

# Générer un manifest global de toutes les mini-apps déployées
echo -e "${BLUE}▶ Génération du manifest global...${NC}"
MANIFEST_FILE="$OUTPUT_DIR/manifest.json"

echo "{" > "$MANIFEST_FILE"
echo "  \"generated_at\": \"$(date -u +"%Y-%m-%dT%H:%M:%SZ")\"," >> "$MANIFEST_FILE"
echo "  \"miniapps\": [" >> "$MANIFEST_FILE"

FIRST=true
for MINIAPP in "${ALL_MINIAPPS[@]}"; do
  MINIAPP_MANIFEST="$OUTPUT_DIR/$MINIAPP/manifest.json"
  if [[ -f "$MINIAPP_MANIFEST" ]]; then
    if [[ "$FIRST" == "true" ]]; then
      FIRST=false
    else
      echo "    ," >> "$MANIFEST_FILE"
    fi
    # Extraire l'id du manifest
    MINIAPP_ID=$(grep -o '"id"[[:space:]]*:[[:space:]]*"[^"]*"' "$MINIAPP_MANIFEST" | head -1 | sed 's/.*"id"[[:space:]]*:[[:space:]]*"\([^"]*\)"/\1/')
    MINIAPP_VERSION=$(grep -o '"version"[[:space:]]*:[[:space:]]*"[^"]*"' "$MINIAPP_MANIFEST" | head -1 | sed 's/.*"version"[[:space:]]*:[[:space:]]*"\([^"]*\)"/\1/')
    echo -n "    { \"id\": \"$MINIAPP_ID\", \"version\": \"${MINIAPP_VERSION:-1.0.0}\", \"path\": \"/miniapps/$MINIAPP/\" }" >> "$MANIFEST_FILE"
  fi
done

echo "" >> "$MANIFEST_FILE"
echo "  ]" >> "$MANIFEST_FILE"
echo "}" >> "$MANIFEST_FILE"

echo -e "${GREEN}  ✓ Manifest global généré : $MANIFEST_FILE${NC}"
echo ""

# Résumé
echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo -e "  📊 Résumé du build :"
echo -e "     ${GREEN}✓ Succès  : $SUCCESS${NC}"
if [[ $FAILED -gt 0 ]]; then
  echo -e "     ${RED}✗ Échecs  : $FAILED${NC}"
  echo -e "     ${RED}  → ${FAILED_LIST[*]}${NC}"
fi
if [[ $SKIPPED -gt 0 ]]; then
  echo -e "     ${YELLOW}⚠ Skipped : $SKIPPED${NC}"
fi
echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"

# Exit code non-zero si des builds ont échoué
if [[ $FAILED -gt 0 ]]; then
  exit 1
fi
