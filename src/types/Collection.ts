import { Nft } from './Nft';

export type Collection = {
  nfts: Nft[];
  id: string;
  title?: string;
  description?: string;
  isHidden?: boolean;
};

export type CreateCollectionResponse = {
  collection_id: string;
};

export type GetCollectionsResponse = { collections: Collection[] };
