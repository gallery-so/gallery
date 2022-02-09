import { MetaTagProps } from 'pages/_app';
import { baseUrl } from './baseUrl';

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
    content: `${baseUrl}/api/opengraph/image?${new URLSearchParams({
      path: previewPath,
    }).toString()}`,
  },
  { property: 'twitter:card', content: 'summary_large_image' },
  {
    property: 'twitter:image',
    content: `${baseUrl}/api/opengraph/image?${new URLSearchParams({
      path: previewPath,
      width: '600',
      height: '314',
    }).toString()}`,
  },
  {
    key: 'og:image fallback',
    property: 'og:image',
    content: 'https://storage.googleapis.com/gallery-prod-325303.appspot.com/gallery_full_logo.png',
  },
];
