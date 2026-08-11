// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';
import node from '@astrojs/node';
import vercel from '@astrojs/vercel';

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  output: 'server',
  adapter: process.env.VERCEL
    ? vercel()
    : node({
        mode: 'standalone',
      }),
  server: {
    host: '0.0.0.0',
    port: 4321,
  },
  integrations: [react()],

  vite: {
    plugins: [tailwindcss()],
    ssr: {
      noExternal: true,
    },
    server: {
      fs: {
        strict: false,
      },
    },
  },
});

