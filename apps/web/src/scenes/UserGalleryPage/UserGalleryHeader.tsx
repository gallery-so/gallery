import { useMemo } from 'react';
import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import breakpoints from '~/components/core/breakpoints';
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
          }
          farcaster {
            username
          }
          twitter {
            username
          }
        }

        ...UserNameAndDescriptionHeaderFragment
        ...UserTwitterSectionFragment
        ...UserFarcasterSectionFragment
        ...UserSharedInfoFragment
        ...GalleryNavLinksFragment
        ...GalleryNavLinksPaginationFragment
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
      user.socialAccounts?.farcaster?.username,
      user.socialAccounts?.lens?.username,
      user.socialAccounts?.twitter?.username,
    ].filter((username) => Boolean(username)).length;
  }, [
    user.socialAccounts?.farcaster?.username,
    user.socialAccounts?.lens?.username,
    user.socialAccounts?.twitter?.username,
  ]);

  return (
    <VStack gap={24}>
      <VStack gap={12}>
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
        {isMobile && (
          <MobileNavLinks align="center" justify="center">
            <GalleryNavLinks username={user.username ?? ''} queryRef={user} postsQueryRef={user} />
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
  padding: 16px 0;
  border-bottom: 1px solid ${colors.porcelain};
  border-top: 1px solid ${colors.porcelain};
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
