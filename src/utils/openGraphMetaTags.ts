import { MetaTagProps } from 'pages/_app';

type Params = {
  title: string;
  previewPath: string;
};

export const openGraphMetaTags = ({
  title,
  previewPath,
}: Params): Required<MetaTagProps['metaTags']> => [
  { property: 'og:title', content: title },
  // TODO: add description
  {
    property: 'og:image',
    content: `https://gallery-opengraph.vercel.app/api/opengraph/image?${new URLSearchParams({
      path: previewPath,
      fallback:
        'https://storage.googleapis.com/gallery-prod-325303.appspot.com/gallery_full_logo_v2.1.png',
    }).toString()}`,
  },
  { property: 'twitter:card', content: 'summary_large_image' },
  {
    property: 'twitter:image',
    content: `https://gallery-opengraph.vercel.app/api/opengraph/image?${new URLSearchParams({
      path: previewPath,
      width: '600',
      height: '314',
      fallback:
        'https://storage.googleapis.com/gallery-prod-325303.appspot.com/gallery_full_logo_v2.1.png',
    }).toString()}`,
  },
];
