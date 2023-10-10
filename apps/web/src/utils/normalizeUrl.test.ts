import { Route } from 'nextjs-routes';

import { normalizeUrl } from './normalizeUrl';

describe('normalizeUrl', () => {
  test('should handle string external URLs', () => {
    expect(normalizeUrl({ to: 'https://google.com' })).toBe('https://google.com');
    expect(normalizeUrl({ to: 'https://prohibition.art/contract/1' })).toBe(
      'https://prohibition.art/contract/1'
    );
    expect(normalizeUrl({ href: 'https://google.com' })).toBe('https://google.com');
    expect(normalizeUrl({ href: 'https://prohibition.art/contract/1' })).toBe(
      'https://prohibition.art/contract/1'
    );
  });

  test('should normalize string internal URLs', () => {
    expect(normalizeUrl({ to: '/bingbong' })).toBe('https://gallery.so/bingbong');
    expect(normalizeUrl({ to: '/community/12345' })).toBe('https://gallery.so/community/12345');

    expect(normalizeUrl({ href: '/bingbong' })).toBe('https://gallery.so/bingbong');
    expect(normalizeUrl({ href: '/community/12345' })).toBe('https://gallery.so/community/12345');
  });

  test('should normalize internal Route objects', () => {
    const userRoute: Route = {
      pathname: '/[username]',
      query: { username: 'bingbong' },
    };

    const communityRoute: Route = {
      pathname: '/community/[chain]/[contractAddress]',
      query: {
        contractAddress: '12345' as string,
        chain: 'Ethereum' as string,
      },
    };

    expect(normalizeUrl({ to: userRoute })).toBe('https://gallery.so/bingbong');

    expect(normalizeUrl({ to: communityRoute })).toBe(
      'https://gallery.so/community/Ethereum/12345'
    );
  });
});
