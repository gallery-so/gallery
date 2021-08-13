import { Collection } from 'types/Collection';

export type CreateCollectionRequest = {
  // list of NFT IDs
  nfts: string[];
};

export type CreateCollectionResponse = {
  collection_id: string;
};

export type GetCollectionsResponse = { collections: Collection[] };

export type UpdateCollectionRequest = {
  id: string;
  name: string;
  collectors_note: string;
};

export type UpdateCollectionResponse = null;
