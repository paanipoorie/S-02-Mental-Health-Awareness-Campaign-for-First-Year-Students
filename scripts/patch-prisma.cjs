const fs = require('fs');
const path = require('path');

const targets = [
  path.resolve(__dirname, '../apps/api/node_modules/.bin/prisma'),
  path.resolve(__dirname, '../node_modules/.bin/prisma'),
];

const wrapperContent = `#!/usr/bin/env node
const { spawnSync } = require('child_process');
const path = require('path');

const realPrisma = path.resolve(__dirname, '../prisma/build/index.js');
const args = process.argv.slice(2);
const res = spawnSync(process.execPath, [realPrisma, ...args], {
  encoding: 'utf-8',
  env: process.env,
});

if (res.stdout) process.stdout.write(res.stdout);
if (res.stderr) process.stderr.write(res.stderr);

if (res.status !== 0) {
  const isMigrateDeploy = args.includes('migrate') && args.includes('deploy');
  const combined = (res.stdout || '') + (res.stderr || '');
  if (isMigrateDeploy && (combined.includes('P1001') || combined.includes("Can't reach database"))) {
    console.warn('\\n[build-guard] Database unreachable (Render internal network not available during build).');
    console.warn('[build-guard] Gracefully skipping migration during build; migrations will run on server start.\\n');
    process.exit(0);
  }
  process.exit(res.status ?? 1);
}
process.exit(0);
`;

for (const target of targets) {
  try {
    if (fs.existsSync(path.dirname(target))) {
      fs.writeFileSync(target, wrapperContent, { mode: 0o755 });
      console.log(`[patch-prisma] Patched ${target}`);
    }
  } catch (err) {
    console.warn(`[patch-prisma] Could not patch ${target}:`, err.message);
  }
}
