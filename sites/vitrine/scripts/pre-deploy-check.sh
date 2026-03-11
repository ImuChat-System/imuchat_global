#!/bin/bash

# 🚀 Script de pré-déploiement - Site Vitrine ImuChat
# Vérifie que tout est prêt avant le déploiement sur Firebase

set -e

echo "🔍 Vérification pré-déploiement - Site Vitrine ImuChat"
echo "=================================================="
echo ""

# Couleurs pour le terminal
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

SUCCESS=0
WARNINGS=0
ERRORS=0

# Fonction de vérification
check() {
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓${NC} $1"
        SUCCESS=$((SUCCESS + 1))
    else
        echo -e "${RED}✗${NC} $1"
        ERRORS=$((ERRORS + 1))
        return 1
    fi
}

warn() {
    echo -e "${YELLOW}⚠${NC} $1"
    WARNINGS=$((WARNINGS + 1))
}

# 1. Vérifier Node.js
echo "📦 Vérification de l'environnement..."
node --version > /dev/null 2>&1
check "Node.js installé ($(node --version))"

# 2. Vérifier pnpm
pnpm --version > /dev/null 2>&1
check "pnpm installé (v$(pnpm --version))"

# 3. Vérifier Firebase CLI
firebase --version > /dev/null 2>&1
check "Firebase CLI installé (v$(firebase --version))"

# 4. Vérifier les dépendances
echo ""
echo "📚 Vérification des dépendances..."
if [ -d "node_modules" ]; then
    check "node_modules existe"
else
    echo -e "${RED}✗${NC} node_modules manquant - Exécutez: pnpm install"
    ERRORS=$((ERRORS + 1))
fi

# 5. Vérifier les fichiers de configuration
echo ""
echo "⚙️  Vérification de la configuration..."
[ -f "firebase.json" ] && check "firebase.json présent" || { echo -e "${RED}✗${NC} firebase.json manquant"; ERRORS=$((ERRORS + 1)); }
[ -f ".firebaserc" ] && check ".firebaserc présent" || { echo -e "${RED}✗${NC} .firebaserc manquant"; ERRORS=$((ERRORS + 1)); }
[ -f "next.config.mjs" ] && check "next.config.mjs présent" || { echo -e "${RED}✗${NC} next.config.mjs manquant"; ERRORS=$((ERRORS + 1)); }
[ -f "package.json" ] && check "package.json présent" || { echo -e "${RED}✗${NC} package.json manquant"; ERRORS=$((ERRORS + 1)); }

# 6. Vérifier les images Open Graph
echo ""
echo "🖼️  Vérification des images Open Graph..."
OG_IMAGES=(
    "og-image-default.png"
    "og-image-home.png"
    "og-image-product.png"
    "og-image-features.png"
    "og-image-ai.png"
    "og-image-developers.png"
    "og-image-about.png"
    "og-image-contact.png"
    "og-image-partners.png"
    "og-image-news.png"
    "icon-192x192.png"
    "icon-512x512.png"
)

OG_MISSING=0
for img in "${OG_IMAGES[@]}"; do
    if [ -f "public/$img" ]; then
        # Vérifier la taille du fichier
        SIZE=$(du -k "public/$img" | cut -f1)
        if [[ "$img" == og-image-* ]] && [ $SIZE -gt 300 ]; then
            warn "$img présent mais > 300 KB ($SIZE KB)"
        else
            check "$img présent"
        fi
    else
        echo -e "${RED}✗${NC} $img manquant"
        OG_MISSING=$((OG_MISSING + 1))
        ERRORS=$((ERRORS + 1))
    fi
done

if [ $OG_MISSING -gt 0 ]; then
    echo -e "${RED}⚠ $OG_MISSING images Open Graph manquantes !${NC}"
fi

# 7. Vérifier les traductions
echo ""
echo "🌐 Vérification des traductions..."
LOCALES=("fr" "en")
for locale in "${LOCALES[@]}"; do
    if [ -f "messages/$locale.json" ]; then
        # Vérifier que les clés Partners et News existent
        if grep -q '"Partners"' "messages/$locale.json" && grep -q '"News"' "messages/$locale.json"; then
            check "Traductions $locale complètes (avec Partners et News)"
        else
            warn "Traductions $locale présentes mais Partners/News potentiellement incomplets"
        fi
    else
        echo -e "${RED}✗${NC} Fichier de traduction $locale manquant"
        ERRORS=$((ERRORS + 1))
    fi
done

# 8. Test de build
echo ""
echo "🔨 Test de build Next.js..."
echo "   (Cela peut prendre 30-60 secondes...)"
if pnpm build > /dev/null 2>&1; then
    check "Build Next.js réussi"
    
    # Vérifier la structure du dossier out
    if [ -d "out" ]; then
        # Compter les fichiers HTML générés
        HTML_COUNT=$(find out -name "*.html" | wc -l | tr -d ' ')
        check "Dossier out généré ($HTML_COUNT fichiers HTML)"
        
        # Vérifier que les pages principales existent
        PAGES=("fr" "en" "fr/partners" "fr/news" "fr/product" "fr/features")
        MISSING_PAGES=0
        for page in "${PAGES[@]}"; do
            if [ -f "out/$page.html" ] || [ -f "out/$page/index.html" ]; then
                : # Page existe
            else
                warn "Page $page non trouvée dans out/"
                MISSING_PAGES=$((MISSING_PAGES + 1))
            fi
        done
        
        if [ $MISSING_PAGES -eq 0 ]; then
            check "Toutes les pages principales générées"
        fi
    else
        echo -e "${RED}✗${NC} Dossier out non généré"
        ERRORS=$((ERRORS + 1))
    fi
else
    echo -e "${RED}✗${NC} Échec du build Next.js"
    ERRORS=$((ERRORS + 1))
    warn "Exécutez 'pnpm build' manuellement pour voir les erreurs"
fi

# 9. Vérifier la connexion Firebase
echo ""
echo "🔐 Vérification de la connexion Firebase..."
if firebase projects:list > /dev/null 2>&1; then
    check "Connecté à Firebase"
    
    # Vérifier le projet actif
    CURRENT_PROJECT=$(firebase use 2>&1 | grep "Active Project" | awk '{print $NF}')
    if [ -n "$CURRENT_PROJECT" ]; then
        check "Projet Firebase actif: $CURRENT_PROJECT"
    fi
else
    warn "Non connecté à Firebase - Exécutez: firebase login"
fi

# 10. Taille du build
echo ""
echo "📊 Statistiques du build..."
if [ -d "out" ]; then
    OUT_SIZE=$(du -sh out | cut -f1)
    echo "   Taille totale du site: $OUT_SIZE"
    
    # Vérifier si trop gros (> 100 MB warning)
    OUT_SIZE_MB=$(du -sm out | cut -f1)
    if [ $OUT_SIZE_MB -gt 100 ]; then
        warn "Site > 100 MB - Considérez l'optimisation"
    else
        check "Taille du site optimale ($OUT_SIZE)"
    fi
fi

# Résumé final
echo ""
echo "=================================================="
echo "📊 Résumé de la vérification"
echo "=================================================="
echo -e "${GREEN}✓ Succès: $SUCCESS${NC}"
if [ $WARNINGS -gt 0 ]; then
    echo -e "${YELLOW}⚠ Avertissements: $WARNINGS${NC}"
fi
if [ $ERRORS -gt 0 ]; then
    echo -e "${RED}✗ Erreurs: $ERRORS${NC}"
fi
echo ""

# Résultat final
if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}✓ Prêt pour le déploiement !${NC}"
    echo ""
    echo "Commandes disponibles:"
    echo "  pnpm deploy:preview  - Déployer sur un channel preview"
    echo "  pnpm deploy          - Déployer en production"
    echo ""
    exit 0
else
    echo -e "${RED}✗ Veuillez corriger les erreurs avant de déployer${NC}"
    echo ""
    exit 1
fi
