import {
  mockNftsLite,
  IMAGE_NFT,
  VIDEO_NFT,
  ANIMATION_NFT,
  AUDIO_NFT,
} from './nfts';

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
    nfts: [IMAGE_NFT, VIDEO_NFT, ANIMATION_NFT, AUDIO_NFT],
    title: 'Collection Title',
  };
}
