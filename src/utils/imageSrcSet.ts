import ImgixClient from '@imgix/js-core';

export type ImageSrcSet = {
  srcSet: string;
  src: string;
};

const IMGIX_DOMAIN = 'assets.gallery.so';

// Generates the srcset for an image so we can display different sizes of the image.
// Must be called server side, or it won't be signed with the token.
export function getImageSrcSet(url: string, width: number): ImageSrcSet {
  const client = new ImgixClient({
    domain: IMGIX_DOMAIN,
    secureURLToken: process.env.IMGIX_TOKEN,
  });

  const srcSet = client.buildSrcSet(
    url,
    {
      w: width,
    },
    {
      devicePixelRatios: [1, 2],
    }
  );

  return { srcSet, src: url };
}
