export type Nft = {
  id: string;
  name: string;
  artist?: string;
  imageUrl: string;
  imagePreviewUrl: string;
  description?: string;
  ownerName?: string;
  platformName?: string;
  animationUrl?: string;
};

export type EditModeNft = {
  id: string;
  nft: Nft;
  isSelected?: boolean;
  index: number;
};

type NftNotFoundError = {
  error: 'ERR_NFT_NOT_FOUND';
};

export type NftResponse = Nft | NftNotFoundError;

// typeguard
export function isNftResponseError(res: NftResponse): res is NftNotFoundError {
  return 'error' in res;
}
