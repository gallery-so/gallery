import { HEIGHT_OPENGRAPH_IMAGE, WIDTH_OPENGRAPH_IMAGE } from 'constants/opengraph';
import { MetaTagProps } from 'pages/_app';
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
}: Params): Required<MetaTagProps['metaTags']> => [
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
];
