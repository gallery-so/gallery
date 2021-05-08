import { mockNftsLite } from './nfts';

const collectionNames = ['Punks', 'Longer collection name', undefined];

export function mockCollectionsLite(n: number) {
  const collections = [];

  for (let i = 0; i < n; i++) {
    const nftCount = Math.ceil(Math.random() * 12);
    collections.push({
      id: `${i}`,
      nfts: mockNftsLite(nftCount),
      title: collectionNames[Math.floor(Math.random() * 3)],
      isHidden: !!Math.floor(Math.random() * 2),
    });
  }

  return collections;
}

export function mockSingleCollection() {
  return {
    id: '1',
    nfts: mockNftsLite(5),
    title: 'Collection Title',
  };
}
