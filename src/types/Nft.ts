export type Nft = {
  id: string;
  name: string;
  artist?: string;
  imageUrl: string;
  imagePreviewUrl: string;
  description?: string;
  ownerName?: string;
  platformName?: string;
};

export type EditModeNft = {
  id: string;
  nft: Nft;
  isSelected?: boolean;
  index?: number;
};
