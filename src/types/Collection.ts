import { Nft } from './Nft';

export type Collection = {
  id: string;
  created_at: string;
  last_updated: string;
  name: string;
  collectors_note: string;
  hidden: boolean;
  owner_user_id: string;
  version: number;
  nfts: Nft[];
  layout: CollectionLayout;
};

export type CollectionLayout = {
  columns: number;
  whitespace?: number[];
};
