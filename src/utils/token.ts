import { GOOGLE_CONTENT_IMG_URL } from './regex';

export const FALLBACK_URL = 'https://www.ahhe.com/images/ecommerce/no-img-large.jpg?v=1575380448';

type resizeImageUrlReturnType = {
  url: string;
  success: boolean;
};

export function graphqlGetResizedNftImageUrlWithFallback(
  url: string | null,
  size = 288
): resizeImageUrlReturnType {
  if (url?.endsWith('.gif')) {
    return {
      url,
      success: true,
    };
  }

  // Resizes if google image: https://developers.google.com/people/image-sizing
  if (url?.includes('googleusercontent')) {
    if (url.match(GOOGLE_CONTENT_IMG_URL)) {
      return {
        url: url.replace(GOOGLE_CONTENT_IMG_URL, `=w${size}`),
        success: true,
      };
    }

    return {
      url: `${url}=w${size}`,
      success: false,
    };
  }

  return {
    url: url || FALLBACK_URL,
    success: url ? true : false,
  };
}

const backgroundColorOverrides: Record<string, string> = {
  '0x30cdac3871c41a63767247c8d1a2de59f5714e78': '#E0E0E0', // Obits
};

export function getBackgroundColorOverrideForContract(contractAddress: string) {
  return backgroundColorOverrides[contractAddress] || '';
}
