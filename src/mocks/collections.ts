import { mockNftsLite } from './nfts';

export function mockCollectionsLite(n: number) {
  const collections = [];

  for (let i = 0; i < n; i++) {
    const nftCount = Math.ceil(Math.random() * 50);
    collections.push({
      id: `${i}`,
      nfts: mockNftsLite(nftCount),
    });
  }

  return collections;
}
