import { OrganizeGallery } from 'components/ManageGallery/OrganizeGallery/OrganizeGallery';
import { useLazyLoadQuery } from 'react-relay';
import { graphql } from 'relay-runtime';
import { useCallback } from 'react';
import { editGalleryPageQuery } from '../../../__generated__/editGalleryPageQuery.graphql';
import { useRouter } from 'next/router';
import { WizardFooter } from 'components/WizardFooter';
import { VStack } from 'components/core/Spacer/Stack';
import FullPageStep from 'components/Onboarding/FullPageStep';
import { useCanGoBack } from 'contexts/navigation/GalleryNavigationProvider';

export default function EditGalleryPage() {
  const query = useLazyLoadQuery<editGalleryPageQuery>(
    graphql`
      query editGalleryPageQuery {
        ...OrganizeGalleryFragment
        viewer {
          ... on Viewer {
            user {
              username
            }
          }
        }
      }
    `,
    {}
  );

  const { push, back, query: urlQuery } = useRouter();

  const handleAddCollection = useCallback(() => {
    if (!urlQuery.galleryId) {
      return;
    }

    push({
      pathname: '/gallery/[galleryId]/collection/create',
      query: { galleryId: urlQuery.galleryId as string },
    });
  }, [push, urlQuery.galleryId]);

  const handleEditCollection = useCallback(
    (collectionId: string) => {
      if (!urlQuery.galleryId) {
        return;
      }

      push({
        pathname: '/gallery/[galleryId]/collection/[collectionId]/edit',
        query: { galleryId: urlQuery.galleryId as string, collectionId },
      });
    },
    [push, urlQuery.galleryId]
  );

  const canGoBack = useCanGoBack();
  const handleDone = useCallback(() => {
    if (canGoBack) {
      back();
    } else if (query.viewer?.user?.username) {
      push({ pathname: '/[username]', query: { username: query.viewer.user.username } });
    } else {
      push({ pathname: '/home' });
    }
  }, [back, canGoBack, push, query.viewer?.user?.username]);

  return (
    <VStack>
      <FullPageStep withFooter>
        <OrganizeGallery
          onAddCollection={handleAddCollection}
          onEditCollection={handleEditCollection}
          queryRef={query}
        />
      </FullPageStep>

      <WizardFooter isNextEnabled nextText="Done" onNext={handleDone} />
    </VStack>
  );
}
