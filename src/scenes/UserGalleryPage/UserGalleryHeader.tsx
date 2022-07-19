import { useMemo } from 'react';
import styled from 'styled-components';
import unescape from 'utils/unescape';
import { BaseM, TitleL, TitleM } from 'components/core/Text/Text';
import Spacer from 'components/core/Spacer/Spacer';
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
    <StyledUserGalleryHeader>
      <StyledUsernameWrapper>
        {isMobile ? (
          <StyledUsernameMobile>{displayName}</StyledUsernameMobile>
        ) : (
          <StyledUsername>{displayName}</StyledUsername>
        )}
        <StyledButtonsWrapper>
          {isMobile && (
            <>
              <LinkButton textToCopy={`https://gallery.so/${username}`} />
              <Spacer width={8} />
              <QRCodeButton username={username} styledQrCode={styledQrCode} />
              <Spacer width={8} />
            </>
          )}
          {showMobileLayoutToggle && (
            <MobileLayoutToggle mobileLayout={mobileLayout} setMobileLayout={setMobileLayout} />
          )}
        </StyledButtonsWrapper>
      </StyledUsernameWrapper>
      <Spacer height={2} />
      <StyledUserDetails>
        <BaseM>
          <Markdown text={unescapedBio} />
        </BaseM>
      </StyledUserDetails>
    </StyledUserGalleryHeader>
  );
}

const StyledUserGalleryHeader = styled.div`
  display: flex;
  flex-direction: column;

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

const StyledButtonsWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
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
