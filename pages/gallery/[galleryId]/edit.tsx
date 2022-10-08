import { OrganizeGallery } from 'components/ManageGallery/OrganizeGallery/OrganizeGallery';
import { useLazyLoadQuery } from 'react-relay';
import { graphql } from 'relay-runtime';
import { useCallback } from 'react';
import { editGalleryPageQuery } from '../../../__generated__/editGalleryPageQuery.graphql';
import { useRouter } from 'next/router';

export default function EditGalleryPage() {
  const query = useLazyLoadQuery<editGalleryPageQuery>(
    graphql`
      query editGalleryPageQuery {
        ...OrganizeGalleryFragment
      }
    `,
    {}
  );

  const { push, query: urlQuery } = useRouter();

  const handleAddCollection = useCallback(() => {
    if (!urlQuery.galleryId) {
      return;
    }

    push(`/gallery/${urlQuery.galleryId}/collection/create`);
  }, [push, urlQuery.galleryId]);

  const handleEditCollection = useCallback(
    (collectionId: string) => {
      if (!urlQuery.galleryId) {
        return;
      }

      push(`/gallery/${urlQuery.galleryId}/collection/${collectionId}/edit`);
    },
    [push, urlQuery.galleryId]
  );

  return (
    <OrganizeGallery
      onAddCollection={handleAddCollection}
      onEditCollection={handleEditCollection}
      queryRef={query}
    />
  );
}
