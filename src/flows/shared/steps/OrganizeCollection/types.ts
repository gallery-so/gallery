export type EditModeNftChild = {
  dbid: string;
  name: string;
  lastUpdated: any;
};

export type EditModeNft = {
  id: string;
  nft: EditModeNftChild;
  isSelected?: boolean;
};

export type WhitespaceBlock = {
  // This is here to help with union discrimination in typescript
  whitespace: 'whitespace';
  id: string;
};

// Accepted types for the Dnd Collection Editor
export type StagingItem = EditModeNft | WhitespaceBlock;

export function isEditModeNft(item: StagingItem): item is EditModeNft {
  return 'nft' in item && !!item.nft;
}
