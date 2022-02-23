import { Nft } from 'types/Nft';

export type EditModeNft = {
  id: string;
  nft: Nft;
  isSelected?: boolean;
};

export type WhitespaceBlock = {
  id: string;
};

// Accepted types for the Dnd Collection Editor
export type StagingItem = EditModeNft | WhitespaceBlock;

export function isEditModeNft(item: StagingItem): item is EditModeNft {
  if ((item as EditModeNft).nft) {
    return true;
  }

  return false;
}
