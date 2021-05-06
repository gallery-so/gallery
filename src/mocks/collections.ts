import { mockNftsLite } from './nfts';

const collectionNames = ['Punks', 'Longer collection name', undefined];

export function mockCollectionsLite(n: number) {
  const collections = [];

  for (let i = 0; i < n; i++) {
    const nftCount = Math.ceil(Math.random() * 12);
    collections.push({
      id: `${i}-id`,
      nfts: mockNftsLite(nftCount),
      title: collectionNames[Math.floor(Math.random() * 3)],
    });
  }

  return collections;
}
