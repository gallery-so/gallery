import UserGalleryCollections from 'scenes/UserGalleryPage/UserGalleryCollections';
import { useIsMobileWindowWidth } from 'hooks/useWindowSize';
import useMobileLayout from 'hooks/useMobileLayout';
import NotFound from 'scenes/NotFound/NotFound';
import { removeNullValues } from 'utils/removeNullValues';
import EmptyGallery from 'scenes/UserGalleryPage/EmptyGallery';
import Spacer from 'components/core/Spacer/Spacer';
import UserGalleryHeader from 'scenes/UserGalleryPage/UserGalleryHeader';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import { UserGalleryLayoutFragment$key } from '../../../__generated__/UserGalleryLayoutFragment.graphql';
import { UserGalleryLayoutQueryFragment$key } from '../../../__generated__/UserGalleryLayoutQueryFragment.graphql';
import styled from 'styled-components';
import { contentSize } from 'components/core/breakpoints';

type Props = {
  userRef: UserGalleryLayoutFragment$key;
  queryRef: UserGalleryLayoutQueryFragment$key;
};

export const UserGalleryLayout = ({ userRef, queryRef }: Props) => {
  const user = useFragment(
    graphql`
      fragment UserGalleryLayoutFragment on GalleryUser {
        username
        galleries {
          collections {
            ...UserGalleryCollectionsFragment
          }
        }

        ...UserGalleryHeaderFragment
      }
    `,
    userRef
  );

  const { viewer } = useFragment(
    graphql`
      fragment UserGalleryLayoutQueryFragment on Query {
        viewer {
          ... on Viewer {
            user {
              username
            }
          }
        }
      }
    `,
    queryRef
  );

  const isMobile = useIsMobileWindowWidth();
  const showMobileLayoutToggle = Boolean(isMobile && user.galleries?.[0]?.collections?.length);
  const { mobileLayout, setMobileLayout } = useMobileLayout();

  const [gallery] = user.galleries ?? [];

  const isAuthenticatedUsersPage = user.username === viewer?.user?.username;

  const nonNullCollections = removeNullValues(gallery?.collections);

  const collectionsView = gallery?.collections ? (
    <UserGalleryCollections
      collectionRefs={nonNullCollections}
      isAuthenticatedUsersPage={isAuthenticatedUsersPage}
      mobileLayout={mobileLayout}
    />
  ) : (
    <EmptyGallery message="This user has not set up their gallery yet." />
  );

  return (
    <StyledUserGalleryLayout>
      <Spacer height={32} />
      <UserGalleryHeader
        userRef={user}
        showMobileLayoutToggle={showMobileLayoutToggle}
        mobileLayout={mobileLayout}
        setMobileLayout={setMobileLayout}
      />
      {collectionsView}
    </StyledUserGalleryLayout>
  );
};

const StyledUserGalleryLayout = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;

  max-width: ${contentSize.desktop}px;
`;
