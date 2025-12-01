#!/bin/bash
# Script pour créer tous les repos ImuChat sur GitHub
# Exécuter après: gh auth login

set -e

GITHUB_ORG="ImuChat-System"

# Définition des repos avec description
declare -A REPOS=(
  ["platform-core"]="Backend API et services pour ImuChat - Node.js, Fastify, PostgreSQL"
  ["web-app"]="Application Web ImuChat - Next.js 14, React, TailwindCSS"
  ["mobile-app"]="Application Mobile ImuChat - React Native, Expo"
  ["desktop-app"]="Application Desktop ImuChat - Electron / Tauri"
  ["ui-kit"]="Composants UI partagés - React, Storybook, TailwindCSS"
  ["shared-types"]="Types TypeScript partagés entre les apps"
  ["infra"]="Infrastructure as Code - Terraform, Kubernetes"
)

echo "🚀 Création des repos ImuChat..."
echo ""

for repo in "${!REPOS[@]}"; do
  desc="${REPOS[$repo]}"
  echo "📦 Création de $repo..."
  
  gh repo create "$GITHUB_ORG/$repo" \
    --private \
    --description "$desc" \
    --add-readme \
    --gitignore Node \
    --license MIT \
    || echo "⚠️  $repo existe déjà ou erreur"
  
  echo ""
done

echo "✅ Repos créés !"
echo ""
echo "Prochaines étapes :"
echo "1. bash scripts/clone-all-repos.sh"
echo "2. code ImuChat.code-workspace"
