// Minimal hand-written schema.org types: schema-dts would add a dependency for the two shapes used here.
export interface WebApplicationLd {
  '@context': 'https://schema.org';
  '@type': 'WebApplication';
  name: string;
  applicationCategory: string;
  operatingSystem: string;
  url: string;
  description: string;
  isAccessibleForFree: boolean;
  offers: { '@type': 'Offer'; price: number; priceCurrency: string };
}

export interface BreadcrumbListLd {
  '@context': 'https://schema.org';
  '@type': 'BreadcrumbList';
  itemListElement: { '@type': 'ListItem'; position: number; name: string; item: string }[];
}

export type JsonLdData = WebApplicationLd | BreadcrumbListLd;

/** JSON.stringify, with `<` escaped so a string value can never close the script element. */
export function serializeJsonLd(data: JsonLdData): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}

export function JsonLd({ data }: { data: JsonLdData }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }} />;
}

export function webApplicationLd(opts: { url: string; name: string; description: string }): WebApplicationLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: opts.name,
    applicationCategory: 'FinanceApplication',
    operatingSystem: 'Any',
    url: opts.url,
    description: opts.description,
    isAccessibleForFree: true,
    offers: { '@type': 'Offer', price: 0, priceCurrency: 'USD' },
  };
}

export function breadcrumbLd(items: { name: string; url: string }[]): BreadcrumbListLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, item: it.url })),
  };
}
