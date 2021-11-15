import { NftMediaType } from 'components/core/enums';
import { Nft } from 'types/Nft';

const FALLBACK_URL = 'https://i.ibb.co/q7DP0Dz/no-image.png';

export function getResizedNftImageUrlWithFallback(nft: Nft, size = 288): string {
  const {
    image_url,
    image_original_url,
    asset_contract: { contract_image_url },
  } = nft;

  // Resizes if google image: https://developers.google.com/people/image-sizing
  if (image_url?.includes('googleusercontent')) {
    return `${image_url}=w${size}`;
  }

  return image_original_url || image_url || contract_image_url || FALLBACK_URL;
}

const animationDomains = [
  'https://api.artblocks',
  'https://generator.artblocks',
  'https://api.heaven.computer',
];

export function getFileExtension(url: string) {
  const splitUrl = url.split('.');

  return splitUrl.length < 2 ? '' : splitUrl.pop() ?? '';
}

export function getVideoUrl(nft: Nft) {
  const imageUrlFileExtension = getFileExtension(nft.image_url);
  return imageUrlFileExtension === 'mp4' ? nft.image_url : nft.animation_url;
}

export function isAnimationUrl(assetUrl: string, fileExtension: string) {
  if (fileExtension === 'html') {
    return true;
  }

  return animationDomains.some(animationDomain =>
    assetUrl.includes(animationDomain),
  );
}

export function getMediaTypeForAssetUrl(assetUrl: string) {
  const fileExtension = getFileExtension(assetUrl);

  if (isAnimationUrl(assetUrl, fileExtension)) {
    return NftMediaType.ANIMATION;
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

  if (!nft.animation_url) {
    return NftMediaType.IMAGE;
  }

  return getMediaTypeForAssetUrl(nft.animation_url);
}
