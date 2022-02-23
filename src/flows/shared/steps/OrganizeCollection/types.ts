import { Nft } from 'types/Nft';

export type EditModeNft = {
  id: string;
  nft?: Nft;
  isSelected?: boolean;
};

export type Whitespace = {
  id: string;
};

export type EditModeItem = EditModeNft | Whitespace;
