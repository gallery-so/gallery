export type Nft = {
  id: string;
  name: string;
  artist?: string;
  image_url: string;
  image_preview_url: string;
  isSelected?: boolean;
  index?: number;
};

// TODO find better name
export interface EditModeNft extends Nft {
  isSelected?: boolean;
}
