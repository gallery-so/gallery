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
import { GalleryEditNavbar } from 'contexts/globalLayout/GlobalNavbar/GalleryEditNavbar/GalleryEditNavbar';
import styled from 'styled-components';

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

  const canGoBack = useCanGoBack();
  const handleDone = useCallback(() => {
    if (canGoBack) {
      back();
    } else if (query.viewer?.user?.username) {
      push(`/${query.viewer.user.username}`);
    } else {
      push(`/home`);
    }
  }, [back, canGoBack, push, query.viewer?.user?.username]);

  return (
    <FullPageStep navbar={<GalleryEditNavbar onDone={handleDone} />}>
      <Wrapper>
        <OrganizeGallery
          onAddCollection={handleAddCollection}
          onEditCollection={handleEditCollection}
          queryRef={query}
        />
      </Wrapper>
    </FullPageStep>
  );
}

const Wrapper = styled.div`
  margin-top: 32px;
`;
