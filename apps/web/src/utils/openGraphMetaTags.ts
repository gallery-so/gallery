import { removeNullValues } from 'shared/relay/removeNullValues';

import { HEIGHT_OPENGRAPH_IMAGE, WIDTH_OPENGRAPH_IMAGE } from '~/constants/opengraph';
import { MetaTagProps } from '~/pages/_app';

import isProduction from './isProduction';

type Params = {
  title: string;
  previewPath: string;
};

const baseurl = `https://gallery-opengraph${
  isProduction() ? '' : '-preview'
}.vercel.app/api/opengraph/image`;

export const openGraphMetaTags = ({
  title,
  previewPath,
}: Params): Required<MetaTagProps['metaTags']> => {
  const tags = [
    { property: 'og:title', content: title },
    // TODO: add description
    {
      property: 'og:image',
      content: `${baseurl}?${new URLSearchParams({
        path: previewPath,
        fallback:
          'https://storage.googleapis.com/gallery-prod-325303.appspot.com/gallery_full_logo_v2.1.png',
      }).toString()}`,
    },
    { property: 'twitter:card', content: 'summary_large_image' },
    {
      property: 'twitter:image',
      content: `${baseurl}?${new URLSearchParams({
        path: previewPath,
        width: WIDTH_OPENGRAPH_IMAGE.toString(),
        height: HEIGHT_OPENGRAPH_IMAGE.toString(),
        fallback:
          'https://storage.googleapis.com/gallery-prod-325303.appspot.com/gallery_full_logo_v2.1.png',
      }).toString()}`,
    },
    // farcaster frame embed
    // https://warpcast.notion.site/Farcaster-Frames-4bd47fe97dc74a42a48d3a234636d8c5
    {
      property: 'fc:frame',
      content: 'vNext',
    },
    {
      property: `fc:frame:button:1`,
      content: '→',
    },
    {
      property: 'fc:frame:image',
      content: `${baseurl}?${new URLSearchParams({
        path: `${previewPath}/fcframe`,
        fallback:
          'https://storage.googleapis.com/gallery-prod-325303.appspot.com/gallery_full_logo_v2.1.png',
      }).toString()}`,
    },
    {
      property: 'fc:frame:post_url',
      content: `${baseurl}?${new URLSearchParams({
        path: `${previewPath}/fcframe`,
        fallback:
          'https://storage.googleapis.com/gallery-prod-325303.appspot.com/gallery_full_logo_v2.1.png',
      }).toString()}`,
    },
  ];

  return removeNullValues(tags);
};
