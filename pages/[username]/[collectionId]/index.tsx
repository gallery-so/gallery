import GalleryRoute from 'scenes/_Router/GalleryRoute';
import { GetServerSideProps } from 'next';
import GalleryRedirect from 'scenes/_Router/GalleryRedirect';
import CollectionGalleryPage from 'scenes/CollectionGalleryPage/CollectionGalleryPage';
import { isFeatureEnabled } from 'utils/featureFlag';
import { FeatureFlag } from 'components/core/enums';
import { MetaTagProps } from 'pages/_app';
import { baseUrl } from 'utils/baseUrl';

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
        ? [
            // TODO: fetch collection for better title?
            { property: 'og:title', content: `${username} | Gallery` },
            // TODO: add description
            {
              property: 'og:image',
              content: `${baseUrl}/api/opengraph/image?${new URLSearchParams({
                path: `/opengraph/collection/${collectionId}`,
              }).toString()}`,
            },
            { property: 'twitter:card', content: 'summary_large_image' },
            {
              property: 'twitter:image',
              content: `${baseUrl}/api/opengraph/image?${new URLSearchParams({
                path: `/opengraph/collection/${collectionId}`,
                width: '600',
                height: '314',
              }).toString()}`,
            },
          ]
        : null,
    },
  };
};
