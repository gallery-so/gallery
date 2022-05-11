import NftDetailPageScene from 'scenes/NftDetailPage/NftDetailPage';
import { GetServerSideProps } from 'next';
import GalleryRedirect from 'scenes/_Router/GalleryRedirect';
import { MetaTagProps } from 'pages/_app';
import { openGraphMetaTags } from 'utils/openGraphMetaTags';
import { graphql, useLazyLoadQuery } from 'react-relay';
import { NftIdQuery } from '__generated__/NftIdQuery.graphql';
import GalleryV2Route from 'scenes/_Router/GalleryV2Route';

type NftDetailPageProps = MetaTagProps & {
  nftId: string;
  collectionId: string;
};

export default function NftDetailPage({ collectionId, nftId }: NftDetailPageProps) {
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

  return <GalleryV2Route element={<NftDetailPageScene queryRef={query} nftId={nftId} />} />;
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
