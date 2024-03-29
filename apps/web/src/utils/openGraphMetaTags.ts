import { removeNullValues } from 'shared/relay/removeNullValues';

import { HEIGHT_OPENGRAPH_IMAGE, WIDTH_OPENGRAPH_IMAGE } from '~/constants/opengraph';
import { MetaTagProps } from '~/pages/_app';

import isProduction from './isProduction';

type Params = {
  title: string;
  path: string;
  isFcFrameCompatible: boolean;
  buttonContent?: string;
};

const baseurl = `https://gallery-opengraph${isProduction() ? '' : '-preview'}.vercel.app/api/og`;

export const openGraphMetaTags = ({
  title,
  path,
  isFcFrameCompatible,
  buttonContent = '→',
}: Params): Required<MetaTagProps['metaTags']> => {
  const tags = [
    { property: 'og:title', content: title },
    // TODO: add description
    {
      property: 'og:image',
      content: `${baseurl}${path}`,
    },
    { property: 'twitter:card', content: 'summary_large_image' },
    {
      property: 'twitter:image',
      content: `${baseurl}${path}?${new URLSearchParams({
        width: WIDTH_OPENGRAPH_IMAGE.toString(),
        height: HEIGHT_OPENGRAPH_IMAGE.toString(),
      }).toString()}`,
    },
  ];

  // farcaster frame embed
  // https://warpcast.notion.site/Farcaster-Frames-4bd47fe97dc74a42a48d3a234636d8c5
  if (isFcFrameCompatible) {
    tags.push(
      {
        property: 'fc:frame',
        content: 'vNext',
      },
      {
        property: `fc:frame:button:1`,
        content: buttonContent,
      },
      {
        property: `fc:frame:button:1:action`,
        content: 'post',
      },
      {
        property: 'fc:frame:image',
        content: `${baseurl}${path}/fcframe`,
      },
      {
        property: 'fc:frame:post_url',
        content: `${baseurl}${path}/fcframe`,
      }
    );
  }

  return removeNullValues(tags);
};
