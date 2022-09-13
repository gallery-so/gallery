import { ReactNode, useCallback, useMemo, useState } from 'react';
import styled from 'styled-components';
import unescape from 'utils/unescape';
import { BaseM, TitleL, TitleM } from 'components/core/Text/Text';
import Markdown from 'components/core/Markdown/Markdown';
import MobileLayoutToggle from './MobileLayoutToggle';
import QRCodeButton from './QRCodeButton';
import LinkButton from './LinkButton';
import { DisplayLayout } from 'components/core/enums';
import breakpoints from 'components/core/breakpoints';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import { UserGalleryHeaderFragment$key } from '__generated__/UserGalleryHeaderFragment.graphql';
import { useQrCode } from 'scenes/Modals/QRCodePopover';
import useIs3ac from 'hooks/oneOffs/useIs3ac';
import TextButton from 'components/core/Button/TextButton';
import { useTrack } from 'contexts/analytics/AnalyticsContext';
import { StyledAnchor } from 'components/core/InteractiveLink/InteractiveLink';
import LinkToNftDetailView from 'scenes/NftDetailPage/LinkToNftDetailView';
import { HStack, VStack } from 'components/core/Spacer/Stack';

type Props = {
  userRef: UserGalleryHeaderFragment$key;
  showMobileLayoutToggle: boolean;
  mobileLayout: DisplayLayout;
  setMobileLayout: (mobileLayout: DisplayLayout) => void;
  isMobile: boolean;
};

function UserGalleryHeader({
  userRef,
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
      }
    `,
    userRef
  );

  const { dbid, username, bio } = user;

  const is3ac = useIs3ac(dbid);
  const displayName = is3ac ? 'The Unofficial 3AC Gallery' : username;

  const unescapedBio = useMemo(() => (bio ? unescape(bio) : ''), [bio]);

  const styledQrCode = useQrCode();

  return (
    <StyledUserGalleryHeader gap={2}>
      <StyledUsernameWrapper>
        {isMobile ? (
          <StyledUsernameMobile>{displayName}</StyledUsernameMobile>
        ) : (
          <StyledUsername>{displayName}</StyledUsername>
        )}
        <StyledButtonsWrapper gap={8} align="center" justify="space-between">
          {isMobile && (
            <>
              <LinkButton textToCopy={`https://gallery.so/${username}`} />
              <QRCodeButton username={username} styledQrCode={styledQrCode} />
            </>
          )}
          {showMobileLayoutToggle && (
            <MobileLayoutToggle mobileLayout={mobileLayout} setMobileLayout={setMobileLayout} />
          )}
        </StyledButtonsWrapper>
      </StyledUsernameWrapper>
      <StyledUserDetails>
        {is3ac ? (
          <ExpandableBio text={unescapedBio} />
        ) : (
          <BaseM>
            <Markdown text={unescapedBio} />
          </BaseM>
        )}
      </StyledUserDetails>
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

const StyledUsernameWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
`;

const StyledUsername = styled(TitleL)`
  overflow-wrap: break-word;
  width: calc(100% - 48px);
`;

const StyledUsernameMobile = styled(TitleM)`
  font-style: normal;
  overflow-wrap: break-word;
  width: calc(100% - 48px);
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
