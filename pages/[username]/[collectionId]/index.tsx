import GalleryRoute from 'scenes/_Router/GalleryRoute';
import { GetServerSideProps } from 'next';
import GalleryRedirect from 'scenes/_Router/GalleryRedirect';
import CollectionGalleryPage from 'scenes/CollectionGalleryPage/CollectionGalleryPage';
import { isFeatureEnabled } from 'utils/featureFlag';
import { FeatureFlag } from 'components/core/enums';
import { MetaTagProps } from 'pages/_app';
import { openGraphMetaTags } from 'utils/openGraphMetaTags';

type CollectionGalleryProps = MetaTagProps & {
  username?: string;
  collectionId?: string;
};

export default function CollectionGallery({ collectionId, username }: CollectionGalleryProps) {
  if (!isFeatureEnabled(FeatureFlag.SINGLE_COLLECTION)) {
    return <GalleryRedirect to={`/${username}`} />;
  }

  if (!username || !collectionId) {
    return <GalleryRedirect to="/" />;
  }

  return (
    <GalleryRoute
      element={<CollectionGalleryPage collectionId={collectionId} username={username} />}
    />
  );
}

export const getServerSideProps: GetServerSideProps<CollectionGalleryProps> = async ({
  params,
}) => {
  const username = params?.username ? (params.username as string) : undefined;
  const collectionId = params?.collectionId ? (params.collectionId as string) : undefined;
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
