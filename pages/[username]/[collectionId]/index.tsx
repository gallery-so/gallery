import { GetServerSideProps } from 'next';
import { route } from 'nextjs-routes';
import { graphql, useLazyLoadQuery } from 'react-relay';

import GalleryViewEmitter from '~/components/internal/GalleryViewEmitter';
import { CollectionNavbar } from '~/contexts/globalLayout/GlobalNavbar/CollectionNavbar/CollectionNavbar';
import { CollectionIdQuery } from '~/generated/CollectionIdQuery.graphql';
import { MetaTagProps } from '~/pages/_app';
import GalleryRedirect from '~/scenes/_Router/GalleryRedirect';
import GalleryRoute from '~/scenes/_Router/GalleryRoute';
import CollectionGalleryPage from '~/scenes/CollectionGalleryPage/CollectionGalleryPage';
import { openGraphMetaTags } from '~/utils/openGraphMetaTags';

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
        ...GalleryViewEmitterWithSuspenseFragment
      }
    `,
    { collectionId, username }
  );

  if (!username || !collectionId) {
    return <GalleryRedirect to={{ pathname: '/' }} />;
  }

  return (
    <GalleryRoute
      navbar={<CollectionNavbar username={username} collectionId={collectionId} queryRef={query} />}
      element={
        <>
          <GalleryViewEmitter queryRef={query} />
          <CollectionGalleryPage queryRef={query} username={username} />
        </>
      }
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
    return { redirect: { permanent: false, destination: route({ pathname: '/' }) } };
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
