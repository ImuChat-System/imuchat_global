/**
 * Metro configuration for pnpm monorepo with Expo
 *
 * Problème : pnpm utilise des symlinks et un store central (.pnpm),
 * Metro ne suit pas les symlinks par défaut et ne sait pas résoudre
 * les modules à travers la structure pnpm.
 *
 * Solution : on configure Metro pour :
 * 1. Surveiller la racine du monorepo (watchFolders)
 * 2. Résoudre les modules depuis les node_modules locaux ET racine
 * 3. Suivre les symlinks (unstable_enableSymlinks)
 * 4. Permettre la résolution hiérarchique pour les sous-dépendances
 */
const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");
const fs = require("fs");

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, "..");

module.exports = (async () => {
  const config = await getDefaultConfig(projectRoot);

  // 1. Surveiller la racine du monorepo pour les workspace packages
  config.watchFolders = [workspaceRoot];

  // 2. Activer le support des symlinks pnpm
  config.resolver.unstable_enableSymlinks = true;

  // 3. Permettre la résolution hiérarchique (CRITIQUE : ne PAS désactiver)
  //    Sans ça, les sous-dépendances internes (ex: expo-router/entry-classic)
  //    ne peuvent pas se résoudre entre elles
  config.resolver.disableHierarchicalLookup = false;

  // 4. Chemins de résolution des modules :
  //    - D'abord les node_modules locaux (symlinks pnpm du workspace)
  //    - Puis les node_modules racine (tout le hoisted store pnpm)
  config.resolver.nodeModulesPaths = [
    path.resolve(projectRoot, "node_modules"),
    path.resolve(workspaceRoot, "node_modules"),
  ];

  // 5. Fallback : pour tout module non trouvé localement,
  //    chercher dans les node_modules de la racine du monorepo
  config.resolver.extraNodeModules = new Proxy(
    {},
    {
      get: (_, moduleName) => {
        // D'abord vérifier dans mobile/node_modules
        const localPath = path.resolve(projectRoot, "node_modules", moduleName);
        if (fs.existsSync(localPath)) return localPath;

        // Sinon fallback vers la racine du monorepo
        return path.resolve(workspaceRoot, "node_modules", moduleName);
      },
    },
  );

  // 6. Exclure les dossiers des autres workspace packages pour les performances
  //    (on les résout via les symlinks, pas besoin de les scanner entièrement)
  const workspacePackages = ["web-app", "desktop-app", "site-vitrine", "infra"];
  config.resolver.blockList = [
    ...workspacePackages.map(
      (pkg) => new RegExp(`${workspaceRoot}/${pkg}/node_modules/.*`),
    ),
  ];

  return config;
})();
