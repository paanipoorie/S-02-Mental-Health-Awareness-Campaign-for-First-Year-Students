#!/usr/bin/env node
import { spawn } from 'node:child_process';
import net from 'node:net';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

const root = dirname(dirname(fileURLToPath(import.meta.url)));

const reset = '\x1b[0m';
const bold = '\x1b[1m';
const dim = '\x1b[2m';
const cyan = '\x1b[36m';
const green = '\x1b[32m';
const yellow = '\x1b[33m';
const red = '\x1b[31m';

const WEB_PORT = 4321;
const API_PORT = 3001;
const DB_PORT = 5433;

const REPO_URL =
  'https://github.com/paanipoorie/S-02-Mental-Health-Awareness-Campaign-for-First-Year-Students';
const DEMO_ACCOUNTS = [
  ['Admin', 'admin@cuchd.in'],
];

const args = process.argv.slice(2);
const noSeed = args.includes('--no-seed');
const noDb = args.includes('--no-db');

const children = [];
let shuttingDown = false;

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function isPortOpen(port, timeout = 1500) {
  return new Promise(resolve => {
    const hosts = ['127.0.0.1', '::1'];
    let pending = hosts.length;
    let opened = false;
    for (const host of hosts) {
      const socket = net.createConnection({ host, port });
      const finish = ok => {
        socket.destroy();
        if (ok) {
          opened = true;
        }
        pending -= 1;
        if (pending === 0) {
          resolve(opened);
        }
      };
      socket.setTimeout(timeout);
      socket.once('connect', () => finish(true));
      socket.once('timeout', () => finish(false));
      socket.once('error', () => finish(false));
    }
  });
}

async function waitForPort(port, label, timeoutMs = 45000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    if (await isPortOpen(port)) {
      return true;
    }
    await sleep(500);
  }
  return false;
}

function run(cmd, cmdArgs, label) {
  console.log(`  ${cyan}${bold}●${reset} ${label}`);
  const child = spawn(cmd, cmdArgs, {
    stdio: 'inherit',
    cwd: root,
    env: { ...process.env, FORCE_COLOR: '1' },
  });
  children.push(child);
  child.on('error', err => {
    console.error(`  ${red}${bold}✗${reset} Failed to start ${label}: ${err.message}`);
  });
  child.on('exit', code => {
    if (code && !shuttingDown) {
      console.error(`  ${red}${bold}✗${reset} ${label} exited with code ${code}`);
    }
  });
  return child;
}

async function runStep(cmd, cmdArgs, label) {
  console.log(`  ${cyan}${bold}●${reset} ${label}`);
  await new Promise((resolve, reject) => {
    const child = spawn(cmd, cmdArgs, { stdio: 'inherit', cwd: root });
    child.on('error', reject);
    child.on('exit', code => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`${label} failed with exit code ${code}`));
      }
    });
  });
}

function printBanner() {
  const width = 74;
  const line = '─'.repeat(width);
  const pad = (text, min) => text + ' '.repeat(Math.max(0, min - text.length));

  console.log(`\n${green}${bold}  ┌${line}┐`);
  console.log(`  │${pad('Peerly — Demo Environment', width)}│`);
  console.log(`  └${line}┘${reset}\n`);
  console.log(`  ${bold}Your services are running:${reset}\n`);

  const rows = [
    ['Frontend (web)', `http://localhost:${WEB_PORT}`, green],
    ['Backend API', `http://localhost:${API_PORT}/api`, green],
    ['API health check', `http://localhost:${API_PORT}/api/health`, green],
    ['Realtime (Socket.IO)', `ws://localhost:${API_PORT}`, cyan],
    ['Database (PostgreSQL)', `localhost:${DB_PORT} (postgres/postgres)`, cyan],
    ['Source code', REPO_URL, cyan],
  ];

  for (const [label, value, color] of rows) {
    console.log(`  ${bold}${pad(label, 20)}${reset}${color}${value}${reset}`);
  }

  console.log(`\n  ${bold}Demo accounts (password: ${yellow}hell0@dm1n${reset}${bold}):${reset}`);
  for (const [role, email] of DEMO_ACCOUNTS) {
    console.log(`  ${bold}${pad(role, 20)}${reset}${email}`);
  }

  console.log(
    `\n  ${dim}Press Ctrl+C to stop all services. Re-run with --no-seed to skip reseeding.${reset}\n`
  );
}

async function main() {
  console.log(`${bold}${cyan}══ Peerly Demo ══${reset}\n`);

  if (await isPortOpen(DB_PORT)) {
    console.log(
      `  ${yellow}•${reset} PostgreSQL already running on :${DB_PORT} — skipping docker start`
    );
  } else {
    console.log(`  ${cyan}${bold}●${reset} Starting PostgreSQL container (docker compose)`);
    try {
      await runStep(
        'docker',
        ['compose', '-f', 'docker/docker-compose.yml', 'up', '-d', 'postgres'],
        'Starting PostgreSQL'
      );
      if (!(await waitForPort(DB_PORT, 'PostgreSQL'))) {
        throw new Error('PostgreSQL did not become reachable in time');
      }
    } catch (err) {
      console.error(
        `\n  ${red}${bold}✗${reset} Could not start PostgreSQL. Is Docker running?\n  ${dim}If a database is already running on :${DB_PORT}, re-run with --no-db.${reset}\n`
      );
      process.exit(1);
    }
  }

  if (!noDb) {
    await runStep('pnpm', ['--filter', 'api', 'prisma:generate'], 'Generating Prisma client');
    await runStep('pnpm', ['--filter', 'api', 'prisma:push'], 'Syncing database schema');
    if (noSeed) {
      console.log(`  ${yellow}•${reset} Skipping database seed (--no-seed)`);
    } else {
      await runStep('pnpm', ['--filter', 'api', 'db:seed'], 'Seeding demo data');
    }
  }

  printBanner();

  if (await isPortOpen(API_PORT)) {
    console.log(
      `  ${yellow}•${reset} Backend API already running on :${API_PORT} — skipping start`
    );
  } else {
    run('pnpm', ['--filter', 'api', 'dev'], 'Starting backend API (port 3001)');
    if (await waitForPort(API_PORT)) {
      console.log(`  ${green}${bold}✓${reset} Backend API is up`);
    } else {
      console.error(`  ${red}${bold}✗${reset} Backend API did not become ready`);
    }
  }

  if (await isPortOpen(WEB_PORT)) {
    console.log(`  ${yellow}•${reset} Frontend already running on :${WEB_PORT} — skipping start`);
  } else {
    run('pnpm', ['--filter', 'web', 'dev'], 'Starting frontend (port 4321)');
    if (await waitForPort(WEB_PORT)) {
      console.log(`  ${green}${bold}✓${reset} Frontend is up`);
    } else {
      console.error(`  ${red}${bold}✗${reset} Frontend did not become ready`);
    }
  }

  console.log(`\n  ${bold}${green}All services ready. Open the links above.${reset}\n`);
}

process.on('SIGINT', () => {
  if (shuttingDown) {
    return;
  }
  shuttingDown = true;
  console.log(`\n  ${yellow}Shutting down services...${reset}`);
  for (const child of children) {
    try {
      child.kill('SIGTERM');
    } catch {
      // ignore
    }
  }
  setTimeout(() => process.exit(0), 500);
});

process.on('SIGTERM', () => process.emit('SIGINT'));

main().catch(err => {
  console.error(`\n  ${red}${bold}✗${reset} ${err.message}`);
  process.exit(1);
});
