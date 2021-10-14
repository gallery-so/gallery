import { Nft } from 'types/Nft';

export type EditModeNft = {
  id: string;
  nft: Nft;
  isSelected?: boolean;
};
