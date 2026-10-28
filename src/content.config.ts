import { defineCollection, reference } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// Files starting with "_" (templates) are ignored.
const pattern = '**/[^_]*.md';

const portfolio = defineCollection({
  loader: glob({ pattern, base: './src/content/portfolio' }),
  schema: z.object({
    name: z.string(),
    sector: z.string(),
    category: z.enum(['infra', 'defi', 'credit', 'ai']),
    stage: z.enum(['Pre-seed', 'Seed', 'Strategic']),
    year: z.number().int(),
    website: z.string().optional(),
    summary: z.string(),
    accent: z.string().default('#393A8F'),
    tint: z.string().default('#EDEDF6'),
    logo: z.string().optional(),
    labsInfra: z.boolean().default(false),
    draft: z.boolean().default(false),
  }),
});

const team = defineCollection({
  loader: glob({ pattern, base: './src/content/team' }),
  schema: z.object({
    name: z.string(),
    role: z.string(),
    order: z.number().default(100),
    summary: z.string(),
    photo: z.string().optional(),
    linkedin: z.string().optional(),
    x: z.string().optional(),
    alumniOf: z.array(z.string()).default([]),
    knowsAbout: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
  }),
});

const insights = defineCollection({
  loader: glob({ pattern, base: './src/content/insights' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    updated: z.coerce.date().optional(),
    author: reference('team'),
    tags: z.array(z.string()).default([]),
    companies: z.array(reference('portfolio')).default([]),
    draft: z.boolean().default(false),
  }),
});

// Legal notice and privacy policy: the text lives in Markdown, the company details come from site.config.mjs.
const legal = defineCollection({
  loader: glob({ pattern, base: './src/content/legal' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    updated: z.coerce.date(),
  }),
});

export const collections = { portfolio, team, insights, legal };
