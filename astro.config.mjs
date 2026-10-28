// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { SITE_URL } from './src/site.config.mjs';

export default defineConfig({
  site: SITE_URL,
  // Pages are built as /portfolio.html and served at /portfolio (see vercel.json: cleanUrls).
  trailingSlash: 'never',
  build: { format: 'file' },
  integrations: [
    sitemap({
      filter: (page) => !/\/(404|contact\/sent)$/.test(page),
    }),
  ],
});
