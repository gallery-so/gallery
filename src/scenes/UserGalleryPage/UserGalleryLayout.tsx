import UserGalleryCollections from 'scenes/UserGalleryPage/UserGalleryCollections';
import { useIsMobileWindowWidth } from 'hooks/useWindowSize';
import useMobileLayout from 'hooks/useMobileLayout';
import EmptyGallery from 'scenes/UserGalleryPage/EmptyGallery';
import Spacer from 'components/core/Spacer/Spacer';
import UserGalleryHeader from 'scenes/UserGalleryPage/UserGalleryHeader';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import { UserGalleryLayoutFragment$key } from '__generated__/UserGalleryLayoutFragment.graphql';
import { UserGalleryLayoutQueryFragment$key } from '__generated__/UserGalleryLayoutQueryFragment.graphql';
import styled from 'styled-components';
import { useGlobalLayoutActions } from 'contexts/globalLayout/GlobalLayoutContext';
import { useEffect } from 'react';
import NavActionFollow from 'components/Follow/NavActionFollow';
import useIsFigure31ProfilePage from 'hooks/oneOffs/useIsFigure31ProfilePage';
type Props = {
  userRef: UserGalleryLayoutFragment$key;
  queryRef: UserGalleryLayoutQueryFragment$key;
};

export const UserGalleryLayout = ({ userRef, queryRef }: Props) => {
  const query = useFragment(
    graphql`
      fragment UserGalleryLayoutQueryFragment on Query {
        ...UserGalleryCollectionsQueryFragment
        ...NavActionFollowQueryFragment
      }
    `,
    queryRef
  );

  const user = useFragment(
    graphql`
      fragment UserGalleryLayoutFragment on GalleryUser {
        username
        galleries {
          collections {
            __typename
          }

          ...UserGalleryCollectionsFragment
        }
        ...NavActionFollowUserFragment

        ...UserGalleryHeaderFragment
      }
    `,
    userRef
  );

  const isMobile = useIsMobileWindowWidth();
  const showMobileLayoutToggle = Boolean(isMobile && user.galleries?.[0]?.collections?.length);
  const { mobileLayout, setMobileLayout } = useMobileLayout();

  const [gallery] = user.galleries ?? [];

  const collectionsView = gallery?.collections ? (
    <UserGalleryCollections queryRef={query} galleryRef={gallery} mobileLayout={mobileLayout} />
  ) : (
    <EmptyGallery message="This user has not set up their gallery yet." />
  );

  const { setCustomNavLeftContent } = useGlobalLayoutActions();

  useEffect(() => {
    setCustomNavLeftContent(<NavActionFollow userRef={user} queryRef={query} />);

    return () => {
      setCustomNavLeftContent(null);
    };
  }, [query, setCustomNavLeftContent, user]);

  const isFigure31ProfilePage = useIsFigure31ProfilePage();

  return (
    <StyledUserGalleryLayout wide={isFigure31ProfilePage}>
      <Spacer height={isMobile ? 48 : 80} />
      <UserGalleryHeader
        userRef={user}
        showMobileLayoutToggle={showMobileLayoutToggle}
        isMobile={isMobile}
        mobileLayout={mobileLayout}
        setMobileLayout={setMobileLayout}
      />
      {collectionsView}
      <Spacer height={32} />
    </StyledUserGalleryLayout>
  );
};

const StyledUserGalleryLayout = styled.div<{ wide: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;

  max-width: ${({ wide }) => (wide ? 1500 : 1200)}px;
`;
