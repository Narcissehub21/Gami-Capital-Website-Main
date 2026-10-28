// Single place for site-wide settings. Change SITE_URL once the domain is confirmed:
// it drives canonical URLs, the sitemap, Open Graph tags, RSS and llms.txt.
export const SITE_URL = 'https://gami.ventures';

export const SITE = {
  name: 'Gami Capital',
  legalName: 'Gami Capital SA',
  tagline: 'Institutional capital for the onchain economy.',
  description:
    'Gami Capital is a Geneva-based venture investor backing founders who rebuild payments, credit, settlement and asset issuance on blockchain rails for institutions.',
  email: 'contact@gami.ventures',
  address: {
    street: 'Place de Longemalle 1, c/o MN & Associés SA',
    postalCode: '1204',
    city: 'Geneva',
    country: 'CH',
    countryName: 'Switzerland',
  },
  linkedin: 'https://www.linkedin.com/company/gami-capital',
  x: 'https://x.com/Gami_Capital',
  xHandle: '@Gami_Capital',
  labsUrl: 'https://gamilabs.io/',
  locale: 'en_GB',
  foundingYear: '2022',
  founder: 'david-domper',   // team file name of the founder, used in structured data

  // Legal notice. Lines left empty are simply not shown on /legal.
  legal: {
    uid: '',                  // Swiss company number, e.g. 'CHE-123.456.789'
    register: 'Commercial Register of the Canton of Geneva',
    vat: '',                  // e.g. 'CHE-123.456.789 TVA', if registered
    publicationDirector: '',  // person responsible for the content (asked for by French visitors' law)
    regulatory: "Advisors listed in ARIF's Register of Customer Advisors",
    sroUrl: 'https://www.arif.ch/',
    host: 'Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, United States',
    hostUrl: 'https://vercel.com',
  },
};

export const NAV = [
  { href: '/approach', label: 'Approach' },
  { href: '/ecosystem', label: 'Ecosystem' },
  { href: '/portfolio', label: 'Portfolio' },
  { href: '/insights', label: 'Insights' },
  { href: '/team', label: 'Team' },
];

export const CATEGORIES = {
  infra: { name: 'Infrastructure', color: '#393A8F' },
  defi: { name: 'DeFi', color: '#2F6A6E' },
  credit: { name: 'Credit & RWA', color: '#9496E6' },
  ai: { name: 'AI & privacy', color: '#13142A' },
};
