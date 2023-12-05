import { ReactNode, useCallback, useMemo, useState } from 'react';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import styled, { css } from 'styled-components';

import Badge from '~/components/Badge/Badge';
import breakpoints from '~/components/core/breakpoints';
import TextButton from '~/components/core/Button/TextButton';
import { StyledAnchor } from '~/components/core/GalleryLink/GalleryLink';
import IconContainer from '~/components/core/IconContainer';
import Markdown from '~/components/core/Markdown/Markdown';
import { HStack, VStack } from '~/components/core/Spacer/Stack';
import { BaseM, TitleM } from '~/components/core/Text/Text';
import { ProfilePicture } from '~/components/ProfilePicture/ProfilePicture';
import { useModalActions } from '~/contexts/modal/ModalContext';
import { UserNameAndDescriptionHeaderFragment$key } from '~/generated/UserNameAndDescriptionHeaderFragment.graphql';
import { UserNameAndDescriptionHeaderQueryFragment$key } from '~/generated/UserNameAndDescriptionHeaderQueryFragment.graphql';
import useIs3acProfilePage from '~/hooks/oneOffs/useIs3acProfilePage';
import { useIsMobileWindowWidth } from '~/hooks/useWindowSize';
import { EditPencilIcon } from '~/icons/EditPencilIcon';
import { contexts } from '~/shared/analytics/constants';
import { useTrack } from '~/shared/contexts/AnalyticsContext';
import { useLoggedInUserId } from '~/shared/relay/useLoggedInUserId';
import colors from '~/shared/theme/colors';
import unescape from '~/shared/utils/unescape';
import isFeatureEnabled, { FeatureFlag } from '~/utils/graphql/isFeatureEnabled';
import handleCustomDisplayName from '~/utils/handleCustomDisplayName';

import LinkToFullPageNftDetailModal from '../NftDetailPage/LinkToFullPageNftDetailModal';
import EditUserInfoModal from './EditUserInfoModal';

type Props = {
  userRef: UserNameAndDescriptionHeaderFragment$key;
  queryRef: UserNameAndDescriptionHeaderQueryFragment$key;
};

export function UserNameAndDescriptionHeader({ userRef, queryRef }: Props) {
  const user = useFragment(
    graphql`
      fragment UserNameAndDescriptionHeaderFragment on GalleryUser {
        id
        username
        bio
        badges {
          name
          imageURL
          contract {
            __typename
          }
          ...BadgeFragment
        }
        ...ProfilePictureFragment
      }
    `,
    userRef
  );

  const query = useFragment(
    graphql`
      fragment UserNameAndDescriptionHeaderQueryFragment on Query {
        ...EditUserInfoModalFragment
        ...useLoggedInUserIdFragment
        ...isFeatureEnabledFragment
      }
    `,
    queryRef
  );

  const { username, bio, badges } = user;

  const isMobile = useIsMobileWindowWidth();
  const is3ac = useIs3acProfilePage();

  const loggedInUserId = useLoggedInUserId(query);
  const isAuthenticatedUser = loggedInUserId === user?.id;
  const track = useTrack();

  const isActivityBadgeEnabled = isFeatureEnabled(FeatureFlag.ACTIVITY_BADGE, query);

  const { showModal } = useModalActions();
  const handleEditBioAndName = useCallback(() => {
    if (!isAuthenticatedUser) return;

    track('Edit User Info Clicked');

    showModal({
      content: <EditUserInfoModal queryRef={query} />,
      headerText: 'Edit profile',
    });
  }, [isAuthenticatedUser, query, showModal, track]);

  const unescapedBio = useMemo(() => (bio ? unescape(bio) : ''), [bio]);

  const userBadges = useMemo(() => {
    if (!badges) return [];

    if (!isActivityBadgeEnabled) {
      return badges.filter((badge) => badge?.contract && badge?.imageURL);
    }

    return badges.filter((badge) => badge?.imageURL);
  }, [badges, isActivityBadgeEnabled]);

  if (!username) {
    return null;
  }

  const displayName = handleCustomDisplayName(username);

  return (
    <HeaderContainer
      gap={12}
      align="center"
      onClick={handleEditBioAndName}
      inline
      isAuth={isAuthenticatedUser}
      hasMobileContent={isMobile && Boolean(unescapedBio)}
    >
      <Container gap={4}>
        <HStack align="center" gap={4}>
          <HStack gap={8} align="center">
            <ProfilePicture userRef={user} size="md" clickDisabled />
            <StyledUsername>{displayName}</StyledUsername>
          </HStack>

          <HStack align="center" gap={0}>
            {userBadges.map((badge) =>
              badge ? (
                <Badge key={badge.name} badgeRef={badge} eventContext={contexts.UserGallery} />
              ) : null
            )}
          </HStack>
        </HStack>

        <HStack align="center" gap={8} grow>
          <StyledUserDetails>
            {is3ac ? (
              <ExpandableBio text={unescapedBio} />
            ) : (
              <StyledBioWrapper>
                <Markdown text={unescapedBio} eventContext={contexts.UserGallery} />
              </StyledBioWrapper>
            )}
          </StyledUserDetails>
        </HStack>
      </Container>

      {isAuthenticatedUser && !isMobile && (
        <EditIconContainer>
          <IconContainer size="sm" variant="stacked" icon={<EditPencilIcon />} />
        </EditIconContainer>
      )}
    </HeaderContainer>
  );
}

const ExpandableBio = ({ text }: { text: string }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const truncated = useMemo(() => {
    return text.split('\n').slice(0, 5).join('\n');
  }, [text]);

  const track = useTrack();

  const handleClick = useCallback(() => {
    setIsExpanded(true);
    track('Read More Button Click: User Bio');
  }, [track]);

  return (
    <VStack gap={12}>
      <BaseM>
        <Markdown
          text={isExpanded ? text : truncated}
          CustomInternalLinkComponent={NftDetailViewer}
          eventContext={contexts.UserGallery}
        />
      </BaseM>
      {isExpanded ? null : (
        <TextButton
          eventElementId="Read More Bio Button"
          eventName="Read More Bio"
          eventContext={contexts.UserGallery}
          text="Read More"
          onClick={handleClick}
        />
      )}
    </VStack>
  );
};

type NftDetailViewerProps = {
  href: string;
  children?: ReactNode;
};

const NftDetailViewer = ({ href, children }: NftDetailViewerProps) => {
  const [, username, collectionId, tokenId] = href.split('/');

  if (
    typeof username === 'undefined' ||
    typeof collectionId === 'undefined' ||
    typeof tokenId === 'undefined'
  ) {
    return null;
  }

  return (
    <LinkToFullPageNftDetailModal
      username={username}
      collectionId={collectionId}
      tokenId={tokenId}
      eventContext={contexts.UserGallery}
    >
      <StyledAnchor>{children}</StyledAnchor>
    </LinkToFullPageNftDetailModal>
  );
};

const EditIconContainer = styled.div`
  opacity: 0;
  transition: opacity 150ms ease-in-out;
`;

const HeaderContainer = styled(HStack)<{ isAuth: boolean; hasMobileContent: boolean }>`
  width: max-content;

  padding: ${({ hasMobileContent }) => (hasMobileContent ? '4px 12px 4px 0px' : '0')};

  max-width: 100%;

  @media only screen and ${breakpoints.tablet} {
    padding: 4px 12px 4px 0px;
  }

  ${({ isAuth }) =>
    isAuth &&
    css`
      cursor: pointer;

      &:hover {
        padding: 4px 12px 4px;
        margin-left: -12px;
        background-color: ${colors.faint};

        ${EditIconContainer} {
          opacity: 1;
        }
      }
    `}
`;

const StyledBioWrapper = styled(BaseM)`
  display: -webkit-box;
  -webkit-box-orient: vertical;
  overflow: hidden;
  -webkit-line-clamp: unset;
`;

const StyledUsername = styled(TitleM)`
  overflow-wrap: break-word;
  font-style: normal;
`;

const Container = styled(VStack)``;

const StyledUserDetails = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  max-width: 100%;
  word-break: break-word;
`;
