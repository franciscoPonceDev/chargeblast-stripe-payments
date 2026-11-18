import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { JsonLd, breadcrumbLd, serializeJsonLd, webApplicationLd } from './JsonLd';

describe('JsonLd', () => {
  it('escapes < so a value cannot break out of the script', () => {
    const data = webApplicationLd({ url: 'https://x.test', name: '</script><script>alert(1)</script>', description: 'd' });
    const out = serializeJsonLd(data);
    expect(out).not.toContain('</script>');
    expect(out).toContain('\\u003c/script>');
    expect(JSON.parse(out).name).toBe('</script><script>alert(1)</script>');
  });

  it('renders an ld+json script', () => {
    const { container } = render(<JsonLd data={breadcrumbLd([{ name: 'Payments', url: 'https://x.test/payments' }])} />);
    const el = container.querySelector('script[type="application/ld+json"]');
    expect(JSON.parse(el!.textContent!)['@type']).toBe('BreadcrumbList');
  });

  it('WebApplication has required props', () => {
    const d = webApplicationLd({ url: 'https://x.test', name: 'N', description: 'D' });
    expect(d).toMatchObject({
      '@type': 'WebApplication',
      name: 'N',
      applicationCategory: 'FinanceApplication',
      operatingSystem: 'Any',
      url: 'https://x.test',
      description: 'D',
      isAccessibleForFree: true,
      offers: { price: 0 },
    });
  });

  it('BreadcrumbList positions items from 1', () => {
    const d = breadcrumbLd([
      { name: 'Payments', url: 'https://x.test/payments' },
      { name: 'Payment pi_1', url: 'https://x.test/payments/pi_1' },
    ]);
    expect(d.itemListElement.map((i) => i.position)).toEqual([1, 2]);
    expect(d.itemListElement[1]).toMatchObject({ name: 'Payment pi_1', item: 'https://x.test/payments/pi_1' });
  });
});
