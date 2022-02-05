import GalleryRoute from 'scenes/_Router/GalleryRoute';
import NftDetailPageScene from 'scenes/NftDetailPage/NftDetailPage';
import { GetServerSideProps } from 'next';
import GalleryRedirect from 'scenes/_Router/GalleryRedirect';
import { baseUrl } from 'utils/baseUrl';
import { MetaTagProps } from 'pages/_app';

type NftDetailPageProps = MetaTagProps & {
  nftId?: string;
};

export default function NftDetailPage({ nftId }: NftDetailPageProps) {
  if (!nftId) {
    // Something went horribly wrong
    return <GalleryRedirect to="/" />;
  }

  return <GalleryRoute element={<NftDetailPageScene nftId={nftId} />} />;
}

export const getServerSideProps: GetServerSideProps<NftDetailPageProps> = async ({ params }) => {
  const username = params?.username ? (params.username as string) : undefined;
  const nftId = params?.nftId ? (params.nftId as string) : undefined;
  return {
    props: {
      nftId,
      metaTags: nftId
        ? [
            // TODO: fetch nft for better title?
            { property: 'og:title', content: `${username} | Gallery` },
            // TODO: add description
            {
              property: 'og:image',
              content: `${baseUrl}/api/opengraph/image?${new URLSearchParams({
                path: `/opengraph/nft/${nftId}`,
              }).toString()}`,
            },
            { property: 'twitter:card', content: 'summary_large_image' },
            {
              property: 'twitter:image',
              content: `${baseUrl}/api/opengraph/image?${new URLSearchParams({
                path: `/opengraph/nft/${nftId}`,
                width: '600',
                height: '314',
              }).toString()}`,
            },
          ]
        : null,
    },
  };
};
