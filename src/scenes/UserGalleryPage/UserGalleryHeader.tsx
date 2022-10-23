import { ReactNode, useCallback, useMemo, useState } from 'react';
import styled from 'styled-components';
import unescape from 'utils/unescape';
import { BaseM, TitleL, TitleM } from 'components/core/Text/Text';
import Markdown from 'components/core/Markdown/Markdown';
import MobileLayoutToggle from './MobileLayoutToggle';
import QRCodeButton from 'contexts/globalLayout/GlobalNavbar/GalleryNavbar/QRCodeButton';
import LinkButton from './LinkButton';
import { DisplayLayout } from 'components/core/enums';
import breakpoints from 'components/core/breakpoints';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import { UserGalleryHeaderFragment$key } from '__generated__/UserGalleryHeaderFragment.graphql';
import { useQrCode } from 'scenes/Modals/QRCodePopover';
import TextButton from 'components/core/Button/TextButton';
import { useTrack } from 'contexts/analytics/AnalyticsContext';
import { StyledAnchor } from 'components/core/InteractiveLink/InteractiveLink';
import LinkToNftDetailView from 'scenes/NftDetailPage/LinkToNftDetailView';
import useIs3acProfilePage from 'hooks/oneOffs/useIs3acProfilePage';
import { HStack, VStack } from 'components/core/Spacer/Stack';
import Badge from 'components/Badge/Badge';
import isFeatureEnabled, { FeatureFlag } from 'utils/graphql/isFeatureEnabled';
import { UserGalleryHeaderQueryFragment$key } from '__generated__/UserGalleryHeaderQueryFragment.graphql';

type Props = {
  userRef: UserGalleryHeaderFragment$key;
  queryRef: UserGalleryHeaderQueryFragment$key;
  showMobileLayoutToggle: boolean;
  mobileLayout: DisplayLayout;
  setMobileLayout: (mobileLayout: DisplayLayout) => void;
  isMobile: boolean;
};

function UserGalleryHeader({
  userRef,
  queryRef,
  showMobileLayoutToggle,
  mobileLayout,
  setMobileLayout,
  isMobile,
}: Props) {
  const user = useFragment(
    graphql`
      fragment UserGalleryHeaderFragment on GalleryUser {
        username @required(action: THROW)
        dbid
        bio
        badges {
          name
          imageURL
          ...BadgeFragment
        }
      }
    `,
    userRef
  );

  const query = useFragment(
    graphql`
      fragment UserGalleryHeaderQueryFragment on Query {
        ...isFeatureEnabledFragment
      }
    `,
    queryRef
  );

  const { username, bio, badges } = user;

  const is3ac = useIs3acProfilePage();
  const displayName = is3ac ? 'The Unofficial 3AC Gallery' : username;

  const unescapedBio = useMemo(() => (bio ? unescape(bio) : ''), [bio]);

  const isArtGobblersEnabled = isFeatureEnabled(FeatureFlag.ART_GOBBLERS, query);

  const userBadges = useMemo(() => {
    if (!badges || !isArtGobblersEnabled) return [];

    return badges.filter((badge) => badge && badge?.imageURL);
  }, [badges, isArtGobblersEnabled]);

  return (
    <StyledUserGalleryHeader gap={2}>
      <HStack align="flex-start" justify="space-between">
        <HStack align="center" gap={8}>
          <StyledUserDetails>
            {is3ac ? (
              <ExpandableBio text={unescapedBio} />
            ) : (
              <BaseM>
                <Markdown text={unescapedBio} />
              </BaseM>
            )}
          </StyledUserDetails>

          {/* TODO(Terence): Test how this looks w/ badges */}
          {userBadges.map((badge) => (badge ? <Badge key={badge.name} badgeRef={badge} /> : null))}
        </HStack>

        <StyledButtonsWrapper gap={8} align="center" justify="space-between">
          {showMobileLayoutToggle && (
            <MobileLayoutToggle mobileLayout={mobileLayout} setMobileLayout={setMobileLayout} />
          )}
        </StyledButtonsWrapper>
      </HStack>
    </StyledUserGalleryHeader>
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
        />
      </BaseM>
      {isExpanded ? null : <TextButton text="Read More" onClick={handleClick} />}
    </VStack>
  );
};

type NftDetailViewerProps = {
  href: string;
  children?: ReactNode;
};

const NftDetailViewer = ({ href, children }: NftDetailViewerProps) => {
  const [, username, collectionId, tokenId] = href.split('/');
  return (
    <LinkToNftDetailView
      username={username ?? ''}
      collectionId={collectionId}
      tokenId={tokenId}
      originPage="gallery"
    >
      <StyledAnchor>{children}</StyledAnchor>
    </LinkToNftDetailView>
  );
};

const StyledUserGalleryHeader = styled(VStack)`
  width: 100%;
`;

const StyledUsername = styled(TitleL)`
  overflow-wrap: break-word;
  width: calc(100% - 48px);
  flex: 1;
`;

const StyledUsernameMobile = styled(TitleM)`
  font-style: normal;
  overflow-wrap: break-word;
  width: calc(100% - 48px);
  flex: 1;
`;

const StyledButtonsWrapper = styled(HStack)`
  height: 36px;
  @media only screen and ${breakpoints.mobile} {
    height: 28px;
  }
`;

const StyledUserDetails = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: 100%;
  word-break: break-word;

  @media only screen and ${breakpoints.tablet} {
    width: 70%;
  }
`;

export default UserGalleryHeader;
