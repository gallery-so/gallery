import { removeNullValues } from 'shared/relay/removeNullValues';

import { HEIGHT_OPENGRAPH_IMAGE, WIDTH_OPENGRAPH_IMAGE } from '~/constants/opengraph';
import { MetaTagProps } from '~/pages/_app';

import isProduction from './isProduction';

type Params = {
  title: string;
  previewPath: string;
  position?: string;
};

const baseurl = `https://gallery-opengraph${
  isProduction() ? '' : '-preview'
}.vercel.app/api/opengraph/image`;

export const openGraphMetaTags = ({
  title,
  previewPath,
  position,
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
    // TODO: might be able to remove this
    // // set `previous` button only if a position is set, implying the user can traverse backwards
    // position
    //   ? {
    //       property: 'fc:frame:button:1',
    //       content: '←',
    //     }
    //   : null,
    // // set `next` button all the time; conditionally set $id depending on whether `previous` button exists,
    // // since $id must increment from 1.
    {
      property: `fc:frame:button:1`,
      content: '→',
    },
    {
      property: 'fc:frame:image',
      content: `${baseurl}?${new URLSearchParams({
        // TODO: might be able to remove this
        path: `${previewPath}/fcframe${position ? `/position` : ''}`,
        fallback:
          'https://storage.googleapis.com/gallery-prod-325303.appspot.com/gallery_full_logo_v2.1.png',
      }).toString()}`,
    },
  ];

  return removeNullValues(tags);
};
