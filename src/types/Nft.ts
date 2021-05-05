export type Nft = {
  id: string;
  name: string;
  artist?: string;
  image_url: string;
  image_preview_url: string;
};

export type EditModeNft = {
  id: string;
  nft: Nft;
  isSelected?: boolean;
  index?: number;
};
