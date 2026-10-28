import rss from '@astrojs/rss';
import type { APIRoute } from 'astro';
import { getEntry } from 'astro:content';
import { getInsights } from '../lib/content';
import { SITE } from '../site.config.mjs';

export const GET: APIRoute = async ({ site }) => {
  const posts = await getInsights();
  const items = await Promise.all(posts.map(async (p) => {
    const author = await getEntry(p.data.author);
    return {
      title: p.data.title,
      description: p.data.description,
      pubDate: p.data.date,
      link: `/insights/${p.id}`,
      categories: p.data.tags,
      author: author ? `${SITE.email} (${author.data.name})` : undefined,
    };
  }));
  return rss({
    title: 'Gami Capital Insights',
    description: 'Investment theses and market notes from the Gami Capital team.',
    site: site!,
    items,
    customData: '<language>en</language>',
  });
};
