import { getCollection } from 'astro:content';

const live = <T extends { data: { draft?: boolean } }>(e: T) => (import.meta.env.PROD ? !e.data.draft : true);

export async function getPortfolio() {
  const all = await getCollection('portfolio', live);
  return all.sort((a, b) => b.data.year - a.data.year || a.data.name.localeCompare(b.data.name));
}

export async function getTeam() {
  const all = await getCollection('team', live);
  return all.sort((a, b) => a.data.order - b.data.order || a.data.name.localeCompare(b.data.name));
}

export async function getInsights() {
  const all = await getCollection('insights', live);
  return all.sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}
