import { SITE } from '../site.config.mjs';

export const abs = (path: string, site: URL) => new URL(path, site).href;
export const orgId = (site: URL) => abs('/#organization', site);
export const personId = (slug: string, site: URL) => abs(`/team/${slug}#person`, site);

export function organizationLd(site: URL) {
  return {
    '@type': 'Organization',
    '@id': orgId(site),
    name: SITE.name,
    legalName: SITE.legalName,
    url: abs('/', site),
    logo: abs('/images/gami-capital-logo.png', site),
    description: SITE.description,
    email: SITE.email,
    address: {
      '@type': 'PostalAddress',
      streetAddress: SITE.address.street,
      postalCode: SITE.address.postalCode,
      addressLocality: SITE.address.city,
      addressCountry: SITE.address.country,
    },
    foundingDate: SITE.foundingYear,
    foundingLocation: { '@type': 'Place', name: `${SITE.address.city}, ${SITE.address.countryName}` },
    ...(SITE.founder ? { founder: { '@id': personId(SITE.founder, site) } } : {}),
    sameAs: [SITE.linkedin, SITE.x],
    knowsAbout: ['Venture capital', 'Decentralized finance', 'Tokenised real-world assets', 'Onchain credit'],
  };
}

export function websiteLd(site: URL) {
  return {
    '@type': 'WebSite',
    '@id': abs('/#website', site),
    url: abs('/', site),
    name: SITE.name,
    publisher: { '@id': orgId(site) },
    inLanguage: 'en',
  };
}

export const fmtDate = (d: Date) =>
  d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });

export const isoDate = (d: Date) => d.toISOString().slice(0, 10);

export const initials = (name: string) =>
  name.split(/\s+/).filter(Boolean).map((p) => p[0]).filter((_, i, a) => i === 0 || i === a.length - 1).join('').toUpperCase();
