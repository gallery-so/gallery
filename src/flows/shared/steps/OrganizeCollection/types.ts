import { Nft } from 'types/Nft';

export type EditModeNft = {
  id: string;
  nft: Nft;
  isSelected?: boolean;
};

export type WhitespaceBlock = {
  // This is hear to help with union discrimination in typescript
  whitespace: 'whitespace';
  id: string;
};

// Accepted types for the Dnd Collection Editor
export type StagingItem = EditModeNft | WhitespaceBlock;

export function isEditModeNft(item: StagingItem): item is EditModeNft {
  return 'nft' in item;
}
