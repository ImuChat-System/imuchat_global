// Root lint-staged config for monorepo
// Delegates linting to each sub-project's own ESLint config

export default {
  // For files in web-app, run eslint with its local config
  'web-app/**/*.{ts,tsx,js,jsx}': (files) => {
    const relativePaths = files.map(f => f.replace(/^.*\/web-app\//, ''))
    return `cd web-app && npx eslint --fix ${relativePaths.join(' ')}`
  },
  
  // For files in mobile, run eslint with its local config
  'mobile/**/*.{ts,tsx,js,jsx}': (files) => {
    const relativePaths = files.map(f => f.replace(/^.*\/mobile\//, ''))
    return `cd mobile && npx eslint --fix ${relativePaths.join(' ')}`
  },
  
  // For files in ui-kit, run eslint with its local config
  'ui-kit/**/*.{ts,tsx,js,jsx}': (files) => {
    const relativePaths = files.map(f => f.replace(/^.*\/ui-kit\//, ''))
    return `cd ui-kit && npx eslint --fix ${relativePaths.join(' ')}`
  },
  
  // For files in desktop-app, run eslint with its local config
  'desktop-app/**/*.{ts,tsx,js,jsx}': (files) => {
    const relativePaths = files.map(f => f.replace(/^.*\/desktop-app\//, ''))
    return `cd desktop-app && npx eslint --fix ${relativePaths.join(' ')}`
  },
  
  // For files in platform-core, shared-types - use root config
  '{platform-core,shared-types}/**/*.{ts,tsx,js,jsx}': 'eslint --fix',
  
  // Prettier for all supported files
  '*.{json,md,yml,yaml}': 'prettier --write',
}
