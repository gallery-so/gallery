import {
  mockNftsLite,
  IMAGE_NFT,
  VIDEO_NFT,
  ANIMATION_NFT,
  AUDIO_NFT,
} from './nfts';
import shuffle from 'utils/shuffle';

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

export function getUniqueMockNfts() {
  return shuffle([IMAGE_NFT, VIDEO_NFT, ANIMATION_NFT, AUDIO_NFT]);
}

function getManyMockNfts() {
  return [
    ...getUniqueMockNfts(),
    ...getUniqueMockNfts(),
    ...getUniqueMockNfts(),
  ];
}

type MockSingleCollectionParams = {
  // because my computer sucks
  noVideos?: boolean;
  withDescription?: boolean;
  aLot?: boolean;
};

const DEFAULT_PARAMS = {
  noVideos: false,
  withDescription: false,
  aLot: false,
};

export function mockSingleCollection({
  noVideos,
  withDescription,
  aLot,
}: MockSingleCollectionParams = DEFAULT_PARAMS) {
  const nfts = (aLot ? getManyMockNfts() : getUniqueMockNfts()).filter((nft) =>
    noVideos ? !nft.animationUrl?.includes('.mp4') : true
  );

  return {
    id: `${Math.random()}`,
    title: 'Collection Title',
    description: withDescription
      ? "Cray edison bulb 90's, 8-bit tumblr art party seitan YOLO glossier kickstarter. Authentic sriracha 8-bit chartreuse tote bag man bun, cloud bread asymmetrical lyft hot chicken. Pork belly letterpress organic."
      : undefined,
    nfts,
  };
}
