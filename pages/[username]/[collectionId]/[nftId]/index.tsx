import NftDetailPageScene from 'scenes/NftDetailPage/NftDetailPage';
import { GetServerSideProps } from 'next';
import GalleryRedirect from 'scenes/_Router/GalleryRedirect';
import { MetaTagProps } from 'pages/_app';
import { openGraphMetaTags } from 'utils/openGraphMetaTags';
import GalleryRoute from 'scenes/_Router/GalleryRoute';

type NftDetailPageProps = MetaTagProps & {
  nftId: string;
  collectionId: string;
};

export default function NftDetailPage({ collectionId, nftId }: NftDetailPageProps) {
  if (!nftId) {
    // Something went horribly wrong
    return <GalleryRedirect to="/" />;
  }

  return (
    <GalleryRoute element={<NftDetailPageScene collectionId={collectionId} nftId={nftId} />} />
  );
}

export const getServerSideProps: GetServerSideProps<NftDetailPageProps> = async ({ params }) => {
  const username = params?.username ? (params.username as string) : undefined;
  const nftId = params?.nftId ? (params.nftId as string) : '';
  const collectionId = params?.collectionId ? (params.collectionId as string) : '';
  return {
    props: {
      nftId,
      collectionId,
      metaTags: nftId
        ? openGraphMetaTags({
            title: `${username} | Gallery`,
            previewPath: `/opengraph/nft/${nftId}`,
          })
        : null,
    },
  };
};
