import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import { CollectionEditorCenterContentFragment$key } from '__generated__/CollectionEditorCenterContentFragment.graphql';
import { GalleryNameAndCollectionName } from 'contexts/globalLayout/GlobalNavbar/CollectionEditorNavbar/GalleryNameAndCollectionName';
import { Route } from 'nextjs-routes';

type CollectionEditorCenterContentProps = {
  galleryId: string;
  queryRef: CollectionEditorCenterContentFragment$key;
};

export function CollectionEditorCenterContent({
  queryRef,
  galleryId,
}: CollectionEditorCenterContentProps) {
  const query = useFragment(
    graphql`
      fragment CollectionEditorCenterContentFragment on Query {
        collectionById(id: $collectionId) {
          ... on Collection {
            name
          }
        }
      }
    `,
    queryRef
  );

  const editGalleryRoute: Route = {
    pathname: '/gallery/[galleryId]/edit',
    query: { galleryId },
  };

  return (
    <GalleryNameAndCollectionName
      editGalleryRoute={editGalleryRoute}
      rightText="Editing"
      galleryName="My gallery"
      collectionName={query.collectionById?.name ?? ''}
    />
  );
}
