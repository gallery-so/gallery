import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import { CollectionEditorCenterContentFragment$key } from '__generated__/CollectionEditorCenterContentFragment.graphql';
import { GalleryNameAndCollectionName } from 'contexts/globalLayout/GlobalNavbar/CollectionEditorNavbar/GalleryNameAndCollectionName';

type CollectionEditorCenterContentProps = {
  queryRef: CollectionEditorCenterContentFragment$key;
};

export function CollectionEditorCenterContent({ queryRef }: CollectionEditorCenterContentProps) {
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

  return (
    <GalleryNameAndCollectionName
      rightText="Editing"
      galleryName="My main gallery"
      collectionName={query.collectionById?.name ?? ''}
    />
  );
}
