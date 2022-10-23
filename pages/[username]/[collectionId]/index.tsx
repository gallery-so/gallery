import { GetServerSideProps } from 'next';
import GalleryRedirect from 'scenes/_Router/GalleryRedirect';
import CollectionGalleryPage from 'scenes/CollectionGalleryPage/CollectionGalleryPage';
import { MetaTagProps } from 'pages/_app';
import { openGraphMetaTags } from 'utils/openGraphMetaTags';
import { graphql, useLazyLoadQuery } from 'react-relay';
import { CollectionIdQuery } from '__generated__/CollectionIdQuery.graphql';
import GalleryRoute from 'scenes/_Router/GalleryRoute';
import { CollectionNavbar } from 'contexts/globalLayout/GlobalNavbar/CollectionNavbar/CollectionNavbar';

type CollectionGalleryProps = MetaTagProps & {
  username: string;
  collectionId: string;
};

export default function CollectionGallery({ collectionId, username }: CollectionGalleryProps) {
  const query = useLazyLoadQuery<CollectionIdQuery>(
    graphql`
      query CollectionIdQuery($collectionId: DBID!, $username: String!) {
        ...CollectionNavbarFragment
        ...CollectionGalleryPageFragment
      }
    `,
    { collectionId, username }
  );

  if (!username || !collectionId) {
    return <GalleryRedirect to="/" />;
  }

  return (
    <GalleryRoute
      navbar={<CollectionNavbar username={username} queryRef={query} />}
      element={<CollectionGalleryPage queryRef={query} username={username} />}
    />
  );
}

export const getServerSideProps: GetServerSideProps<CollectionGalleryProps> = async ({
  params,
}) => {
  const username = params?.username ? (params.username as string) : undefined;
  const collectionId = params?.collectionId ? (params.collectionId as string) : undefined;

  if (!username || !collectionId) {
    // How could they have possibly gotten to this route without those params
    return { redirect: { permanent: false, destination: '/' } };
  }

  return {
    props: {
      username,
      collectionId,
      metaTags: collectionId
        ? openGraphMetaTags({
            title: `${username} | Gallery`,
            previewPath: `/opengraph/collection/${collectionId}`,
          })
        : null,
    },
  };
};
