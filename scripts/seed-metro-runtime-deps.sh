#!/usr/bin/env bash
set -euo pipefail

echo "==> Installation groupée des dépendances runtime au workspace root"

# Liste de paquets fréquemment requis par Expo/metro dans ce monorepo
pkgs=(
  whatwg-fetch
  expo-modules-core
  @babel/runtime
  expo-asset
  react-devtools-core
  abort-controller
  @react-native/virtualized-lists
  memoize-one
  nullthrows
  promise
  setimmediate
  base64-js
  @ungap/structured-clone
  @expo/metro-runtime
  metro-runtime
  invariant
)

echo "Paquets à installer: ${pkgs[*]}"

pnpm add -w "${pkgs[@]}"

echo "==> Installation terminée. Relancer Metro avec 'pnpm --filter ./mobile start -- --clear'"
