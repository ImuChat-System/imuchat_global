#!/usr/bin/env node
/**
 * install-missing-deps.mjs
 * Install missing radix-ui and other npm deps for each mini-app.
 */
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();

const DEPS_MAP = {
  'imu-contests': ['@radix-ui/react-avatar', '@radix-ui/react-checkbox', '@radix-ui/react-separator'],
  'imu-sports': ['@radix-ui/react-separator', 'embla-carousel-react'],
  'imu-finance': ['@radix-ui/react-progress', '@radix-ui/react-avatar', '@radix-ui/react-scroll-area'],
  'imu-formations': ['@radix-ui/react-tooltip', '@radix-ui/react-avatar', '@radix-ui/react-accordion'],
  'imu-dating': ['@radix-ui/react-alert-dialog', '@radix-ui/react-progress', 'react-hook-form', '@hookform/resolvers', 'zod', '@radix-ui/react-checkbox', '@radix-ui/react-select', '@radix-ui/react-tooltip', '@radix-ui/react-switch'],
  'imu-mobility': ['@radix-ui/react-avatar', '@radix-ui/react-radio-group'],
  'imu-library': ['@radix-ui/react-collapsible', '@radix-ui/react-switch', '@radix-ui/react-accordion', '@radix-ui/react-popover', '@radix-ui/react-avatar'],
  'imu-smart-home': ['@radix-ui/react-accordion', '@radix-ui/react-avatar', '@radix-ui/react-checkbox', 'embla-carousel-react'],
  'imu-style-beauty': ['@radix-ui/react-tooltip', '@radix-ui/react-dropdown-menu', '@radix-ui/react-switch'],
};

for (const [mod, deps] of Object.entries(DEPS_MAP)) {
  const pkgPath = path.join(ROOT, mod, 'package.json');
  if (!fs.existsSync(pkgPath)) { console.log(`Skip ${mod}`); continue; }
  
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  const allDeps = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) };
  const missing = deps.filter(d => !allDeps[d]);
  
  if (missing.length === 0) {
    console.log(`✓ ${mod}: all deps present`);
    continue;
  }
  
  console.log(`→ ${mod}: installing ${missing.join(', ')}`);
  try {
    execSync(`cd "${path.join(ROOT, mod)}" && pnpm add ${missing.join(' ')} --no-lockfile`, { 
      stdio: 'pipe',
      timeout: 60000 
    });
    console.log(`  ✓ Done`);
  } catch (e) {
    console.error(`  ✗ Failed: ${e.stderr?.toString().slice(0, 200) || e.message}`);
  }
}

console.log('\nAll done!');
