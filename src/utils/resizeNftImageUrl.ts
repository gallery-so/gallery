import { Nft } from 'types/Nft';

const FALLBACK_URL = 'https://i.ibb.co/q7DP0Dz/no-image.png';

export default function getResizedNftImageUrlWithFallback(
  nft: Nft,
  width: number = 288
): any {
  const { image_url, image_original_url } = nft;
  // resizes if google image: https://developers.google.com/people/image-sizing
  if (image_url && image_url.includes('googleusercontent')) {
    return `${image_url}=s${width}`;
  }
  return image_original_url || FALLBACK_URL;
}
