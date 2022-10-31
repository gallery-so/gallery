import { OrganizeGallery } from 'components/ManageGallery/OrganizeGallery/OrganizeGallery';
import { useLazyLoadQuery } from 'react-relay';
import { graphql } from 'relay-runtime';
import { useCallback } from 'react';
import { editGalleryPageQuery } from '../../../__generated__/editGalleryPageQuery.graphql';
import { useRouter } from 'next/router';
import FullPageStep from 'components/Onboarding/FullPageStep';
import { useCanGoBack } from 'contexts/navigation/GalleryNavigationProvider';
import { GalleryEditNavbar } from 'contexts/globalLayout/GlobalNavbar/GalleryEditNavbar/GalleryEditNavbar';
import styled from 'styled-components';
import breakpoints from 'components/core/breakpoints';

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
  margin-top: 16px;

  @media only screen and ${breakpoints.tablet} {
    margin-top: 24px;
  }
`;
