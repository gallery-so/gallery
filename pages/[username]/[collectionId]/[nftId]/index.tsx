import GalleryRoute from 'scenes/_Router/GalleryRoute';
import NftDetailPageScene from 'scenes/NftDetailPage/NftDetailPage';
import { GetServerSideProps } from 'next';
import GalleryRedirect from 'scenes/_Router/GalleryRedirect';
import { MetaTagProps } from 'pages/_app';
import { openGraphMetaTags } from 'utils/openGraphMetaTags';
import { graphql, useLazyLoadQuery } from 'react-relay';
import { NftIdQuery } from '__generated__/NftIdQuery.graphql';

type NftDetailPageProps = MetaTagProps & {
  nftId: string;
  collectionId: string;
};

export default function NftDetailPage({ collectionId, nftId }: NftDetailPageProps) {
  console.log(collectionId);
  const query = useLazyLoadQuery<NftIdQuery>(
    graphql`
      query NftIdQuery($nftId: DBID!, $collectionId: DBID!) {
        ...NftDetailPageFragment
      }
    `,
    { nftId, collectionId }
  );

  if (!nftId) {
    // Something went horribly wrong
    return <GalleryRedirect to="/" />;
  }

  return (
    <GalleryRoute element={<NftDetailPageScene queryRef={query} nftId={nftId} />} footerIsFixed />
  );
}

export const getServerSideProps: GetServerSideProps<NftDetailPageProps> = async ({ params }) => {
  const username = params?.username ? (params.username as string) : undefined;
  const nftId = params?.nftId ? (params.nftId as string) : undefined;
  const collectionId = params?.collectionId ? (params.collectionId as string) : undefined;
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
