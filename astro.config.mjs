import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: process.env.SITE_URL ?? 'https://levinpaulino.github.io',
  base: process.env.SITE_BASE ?? '/',
  trailingSlash: 'always',
  integrations: [react(), sitemap()],
  build: {
    inlineStylesheets: 'auto',
  },
});
