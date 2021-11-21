import { Nft } from './Nft';

export type Collection = {
  id: string;
  name: string;
  collectors_note: string;
  hidden: boolean;
  creation_time: number;
  owner_user_id: string;
  version: number;
  nfts: Nft[];
  layout: CollectionLayout;
};

export type CollectionLayout = {
  columns: number;
};
