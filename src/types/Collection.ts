import { Nft } from './Nft';

export type Collection = {
  nfts: Nft[];
  id: string;
  title?: string;
  description?: string;
};
