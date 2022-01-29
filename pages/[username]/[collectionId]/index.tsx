import GalleryRoute from 'scenes/_Router/GalleryRoute';
import { GetServerSideProps } from 'next';
import GalleryRedirect from 'scenes/_Router/GalleryRedirect';
import CollectionGalleryPage from 'scenes/CollectionGalleryPage/CollectionGalleryPage';
import { SINGLE_COLLECTION_ENABLED } from 'utils/featureFlag';

type CollectionGalleryProps = {
  username?: string;
  collectionId?: string;
};

export default function UserGallery({ collectionId, username }: CollectionGalleryProps) {
  if (!SINGLE_COLLECTION_ENABLED) {
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
}) => ({
  props: {
    username: params?.username ? (params.username as string) : undefined,
    collectionId: params?.collectionId ? (params.collectionId as string) : undefined,
  },
});
