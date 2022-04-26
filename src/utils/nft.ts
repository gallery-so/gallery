import { GOOGLE_CONTENT_IMG_URL } from './regex';

export const FALLBACK_URL = 'https://www.ahhe.com/images/ecommerce/no-img-large.jpg?v=1575380448';

export function graphqlGetResizedNftImageUrlWithFallback(url: string | null, size = 288): string {
  if (url?.endsWith('.gif')) {
    return url;
  }

  // Resizes if google image: https://developers.google.com/people/image-sizing
  if (url?.includes('googleusercontent')) {
    if (url.match(GOOGLE_CONTENT_IMG_URL)) {
      return url.replace(GOOGLE_CONTENT_IMG_URL, `=w${size}`);
    }

    return `${url}=w${size}`;
  }

  return url || FALLBACK_URL;
}
