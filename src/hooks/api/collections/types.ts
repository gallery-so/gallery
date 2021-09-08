import { Collection } from 'types/Collection';

export type CreateCollectionRequest = {
  gallery_id: string;
  name: string;
  collectors_note: string;
  nfts: string[];
};

export type CreateCollectionResponse = {
  collection_id: string;
};

export type DeleteCollectionRequest = {
  id: string;
};

export type DeleteCollectionResponse = {};

export type GetCollectionsResponse = { collections: Collection[] };

export type UpdateCollectionInfoRequest = {
  id: string;
  name: string;
  collectors_note: string;
};

export type UpdateCollectionInfoResponse = null;

export type UpdateCollectionNftsRequest = {
  id: string;
  nfts: string[];
};

export type UpdateCollectionNftsResponse = null;

export type UpdateCollectionHiddenRequest = {
  id: string;
  hidden: boolean;
};

export type UpdateCollectionHiddenResponse = null;
