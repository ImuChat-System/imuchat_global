const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, "..");

module.exports = (async () => {
  const config = await getDefaultConfig(projectRoot);

  // Watch the monorepo root so Metro resolves pnpm workspace packages
  config.watchFolders = config.watchFolders || [];
  if (!config.watchFolders.includes(workspaceRoot)) {
    config.watchFolders.push(workspaceRoot);
  }

  config.resolver = config.resolver || {};
  config.resolver.nodeModulesPaths = [
    path.resolve(projectRoot, "node_modules"),
    path.resolve(workspaceRoot, "node_modules"),
  ];
  // Prefer these nodeModulesPaths and avoid hierarchical lookup
  config.resolver.disableHierarchicalLookup = true;

  // Map unresolved modules to the workspace node_modules when appropriate.
  // This helps Metro resolve packages hoisted by pnpm when running inside a workspace.
  const extraNodeModules = new Proxy({}, {
    get: (_, name) => path.resolve(workspaceRoot, 'node_modules', name),
  });
  config.resolver.extraNodeModules = extraNodeModules;

  return config;
})();
