import { useMemo } from 'react';
import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import breakpoints, { pageGutter } from '~/components/core/breakpoints';
import { HStack, VStack } from '~/components/core/Spacer/Stack';
import { GalleryNavLinks } from '~/contexts/globalLayout/GlobalNavbar/GalleryNavbar/GalleryNavLinks';
import { UserGalleryHeaderFragment$key } from '~/generated/UserGalleryHeaderFragment.graphql';
import { UserGalleryHeaderQueryFragment$key } from '~/generated/UserGalleryHeaderQueryFragment.graphql';
import { useIsMobileOrMobileLargeWindowWidth } from '~/hooks/useWindowSize';
import colors from '~/shared/theme/colors';

import UserFarcasterSection from './UserFarcasterSection';
import UserLensSection from './UserLensSection';
import { UserNameAndDescriptionHeader } from './UserNameAndDescriptionHeader';
import UserSharedInfo from './UserSharedInfo/UserSharedInfo';
import { StyledUserSocialPill } from './UserSocialPill';
import UserTwitterSection from './UserTwitterSection';

type Props = {
  userRef: UserGalleryHeaderFragment$key;
  queryRef: UserGalleryHeaderQueryFragment$key;
};

export default function UserGalleryHeader({ userRef, queryRef }: Props) {
  const user = useFragment(
    graphql`
      fragment UserGalleryHeaderFragment on GalleryUser {
        username
        dbid
        socialAccounts {
          lens {
            username
            display
          }
          farcaster {
            username
            display
          }
          twitter {
            username
            display
          }
        }

        ...UserNameAndDescriptionHeaderFragment
        ...UserTwitterSectionFragment
        ...UserFarcasterSectionFragment
        ...UserSharedInfoFragment
        ...GalleryNavLinksFragment
        ...UserLensSectionFragment
      }
    `,
    userRef
  );

  const query = useFragment(
    graphql`
      fragment UserGalleryHeaderQueryFragment on Query {
        viewer {
          ... on Viewer {
            user {
              dbid
            }
          }
        }
        ...UserNameAndDescriptionHeaderQueryFragment
        ...UserTwitterSectionQueryFragment
        ...GalleryNavLinksQueryFragment
      }
    `,
    queryRef
  );

  const loggedInUserId = query.viewer?.user?.dbid;
  const isLoggedIn = Boolean(loggedInUserId);
  const isAuthenticatedUsersPage = loggedInUserId === user?.dbid;
  const isMobile = useIsMobileOrMobileLargeWindowWidth();

  const numberOfConnectedAccounts = useMemo(() => {
    return [
      user.socialAccounts?.farcaster?.display && user.socialAccounts?.farcaster?.username,
      user.socialAccounts?.lens?.display && user.socialAccounts?.lens?.username,
      user.socialAccounts?.twitter?.display && user.socialAccounts?.twitter?.username,
    ].filter((username) => Boolean(username)).length;
  }, [user.socialAccounts]);

  return (
    <VStack gap={24}>
      <VStack gap={12}>
        <SpacingContainer gap={12}>
          <UserNameAndDescriptionHeader userRef={user} queryRef={query} />
          {isLoggedIn && !isAuthenticatedUsersPage && <UserSharedInfo userRef={user} />}
          {numberOfConnectedAccounts > 0 ? (
            <SocialConnectionsSection numPills={numberOfConnectedAccounts}>
              <UserTwitterSection userRef={user} queryRef={query} />
              <UserFarcasterSection userRef={user} />
              <UserLensSection userRef={user} />
            </SocialConnectionsSection>
          ) : (
            <SocialConnectionsSection numPills={1}>
              <UserTwitterSection userRef={user} queryRef={query} />
            </SocialConnectionsSection>
          )}
        </SpacingContainer>
        {isMobile && (
          <MobileNavLinks align="center" justify="center">
            <MobileGalleryNavLinks username={user.username ?? ''} userRef={user} queryRef={query} />
          </MobileNavLinks>
        )}
      </VStack>
      <Divider />
    </VStack>
  );
}

const SocialConnectionsSection = styled.div<{ numPills: number }>`
  display: flex;
  gap: 8px;

  ${StyledUserSocialPill} {
    max-width: ${({ numPills }) => 100 / numPills}%;
  }
`;

const MobileNavLinks = styled(HStack)`
  overflow-x: scroll;
  padding: 16px 0;
  border-bottom: 1px solid ${colors.porcelain};
  border-top: 1px solid ${colors.porcelain};

  @media only screen and ${breakpoints.tablet} {
    overflow-x: initial;
  }

  &::-webkit-scrollbar {
    display: none;
  }
`;

const MobileGalleryNavLinks = styled(GalleryNavLinks)`
  padding: 0 16px;
  margin-left: 24px;
`;

const Divider = styled.div`
  width: 100%;
  height: 1px;
  background-color: ${colors.porcelain};
  display: none;

  @media only screen and ${breakpoints.desktop} {
    display: block;
  }
`;

const SpacingContainer = styled(VStack)`
  margin: 0 ${pageGutter.mobile}px 24px;
`;
