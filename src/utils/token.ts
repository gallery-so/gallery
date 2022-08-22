import { GOOGLE_CONTENT_IMG_URL } from './regex';

export const FALLBACK_URL = 'https://www.ahhe.com/images/ecommerce/no-img-large.jpg?v=1575380448';

type resizeImageUrlReturnType =
  | {
      url: string;
    }
  | undefined;

export function graphqlGetResizedNftImageUrlWithFallback(
  url: string | null,
  size = 288
): resizeImageUrlReturnType {
  if (url?.endsWith('.gif')) {
    return {
      url,
    };
  }

  // Resizes if google image: https://developers.google.com/people/image-sizing
  if (url?.includes('googleusercontent')) {
    if (url.match(GOOGLE_CONTENT_IMG_URL)) {
      return {
        url: url.replace(GOOGLE_CONTENT_IMG_URL, `=w${size}`),
      };
    }

    return {
      url: `${url}=w${size}`,
    };
  }

  if (url) {
    return { url };
  }
}

const backgroundColorOverrides: Record<string, string> = {
  '0x30cdac3871c41a63767247c8d1a2de59f5714e78': '#E0E0E0', // Obits
  '0xb47e3cd837ddf8e4c57f05d70ab865de6e193bbb': '#648494', // Cryptopunks
};

export function getBackgroundColorOverrideForContract(contractAddress: string) {
  return backgroundColorOverrides[contractAddress] || '';
}
