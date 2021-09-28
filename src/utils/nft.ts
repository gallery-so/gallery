import { NftMediaType } from 'components/core/enums';
import { Nft } from 'types/Nft';

const FALLBACK_URL = 'https://i.ibb.co/q7DP0Dz/no-image.png';

export function getResizedNftImageUrlWithFallback(
  nft: Nft,
  width = 288,
): string {
  const {
    image_url,
    image_original_url,
    asset_contract: { contract_image_url },
  } = nft;
  // Resizes if google image: https://developers.google.com/people/image-sizing
  if (image_url?.includes('googleusercontent')) {
    return `${image_url}=s${width}`;
  }

  return image_original_url || image_url || contract_image_url || FALLBACK_URL;
}

export function getFileExtension(url: string) {
  const splitUrl = url.split('.');

  return splitUrl.length < 2 ? '' : splitUrl.pop();
}

export function getMediaTypeForAssetUrl(assetUrl: string) {
  const fileExtension = getFileExtension(assetUrl);

  if (!fileExtension) {
    return NftMediaType.IMAGE;
  }

  switch (fileExtension) {
    case 'mp4':
      return NftMediaType.VIDEO;
    case 'mp3':
      return NftMediaType.AUDIO;
    case 'html':
      return NftMediaType.ANIMATION;
    default:
      return NftMediaType.IMAGE;
  }
}

export function getMediaType(nft: Nft) {
  const imageUrlType = getMediaTypeForAssetUrl(nft.image_url);
  if (imageUrlType === NftMediaType.VIDEO) {
    return imageUrlType;
  }

  return getMediaTypeForAssetUrl(nft.animation_url);
}
