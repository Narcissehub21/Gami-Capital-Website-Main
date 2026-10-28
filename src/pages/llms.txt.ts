// /llms.txt: a plain summary of the site for AI assistants and answer engines (https://llmstxt.org).
import type { APIRoute } from 'astro';
import { getPortfolio, getTeam, getInsights } from '../lib/content';
import { SITE, CATEGORIES } from '../site.config.mjs';

export const GET: APIRoute = async ({ site }) => {
  const u = (p: string) => new URL(p, site).href;
  const [companies, team, posts] = await Promise.all([getPortfolio(), getTeam(), getInsights()]);
  const lines = [
    `# ${SITE.name}`,
    '',
    `> ${SITE.description}`,
    '',
    `${SITE.legalName} is based in ${SITE.address.city}, ${SITE.address.countryName}. ${SITE.legal.regulatory}. It invests in equity and tokens from pre-seed to strategic rounds, across ${Object.values(CATEGORIES).map((c) => c.name).join(', ')}, and structures access (direct, fund, actively managed certificates) for qualified investors, family offices, HNWI and financial institutions. Its sister company Gami Labs (${SITE.labsUrl}) is a separate entity that curates institutional DeFi vaults. Contact: ${SITE.email}.`,
    '',
    '## Pages',
    '',
    `- [Approach](${u('/approach')}): what Gami Capital invests in, sectors and stages`,
    `- [Ecosystem](${u('/ecosystem')}): how Gami Capital and Gami Labs work together`,
    `- [Portfolio](${u('/portfolio')}): all ${companies.length} portfolio companies`,
    `- [Team](${u('/team')}): the people behind Gami Capital`,
    `- [Insights](${u('/insights')}): articles and investment theses`,
    `- [Contact](${u('/contact')}): founders and investors`,
    '',
    '## Portfolio',
    '',
    ...companies.map((c) => `- [${c.data.name}](${u(`/portfolio/${c.id}`)}): ${c.data.sector}, ${c.data.stage.toLowerCase()} ${c.data.year}. ${c.data.summary}`),
    '',
    '## Team',
    '',
    ...team.map((p) => `- [${p.data.name}](${u(`/team/${p.id}`)}), ${p.data.role}: ${p.data.summary}`),
  ];
  if (posts.length) {
    lines.push('', '## Insights', '', ...posts.map((p) => `- [${p.data.title}](${u(`/insights/${p.id}`)}): ${p.data.description}`));
  }
  lines.push('', '## Optional', '', `- [Legal notice](${u('/legal')})`, `- [Privacy policy](${u('/privacy')})`, `- [RSS feed](${u('/rss.xml')})`, '');
  return new Response(lines.join('\n'), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
