import { useMemo } from 'react';
import styled from 'styled-components';
import unescape from 'utils/unescape';
import { BaseM, TitleL } from 'components/core/Text/Text';
import Spacer from 'components/core/Spacer/Spacer';
import Markdown from 'components/core/Markdown/Markdown';
import MobileLayoutToggle from './MobileLayoutToggle';
import QRCode from './QRCode';
import LinkButton from './LinkButton';
import { DisplayLayout } from 'components/core/enums';
import breakpoints from 'components/core/breakpoints';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import { UserGalleryHeaderFragment$key } from '__generated__/UserGalleryHeaderFragment.graphql';

type Props = {
  userRef: UserGalleryHeaderFragment$key;
  showMobileLayoutToggle: boolean;
  showQRCode: boolean;
  showLinkButton: boolean;
  mobileLayout: DisplayLayout;
  setMobileLayout: (mobileLayout: DisplayLayout) => void;
};

function UserGalleryHeader({
  userRef,
  showMobileLayoutToggle,
  showQRCode,
  showLinkButton,
  mobileLayout,
  setMobileLayout,
}: Props) {
  const user = useFragment(
    graphql`
      fragment UserGalleryHeaderFragment on GalleryUser {
        username @required(action: THROW)
        bio
      }
    `,
    userRef
  );

  const unescapedBio = useMemo(() => (user.bio ? unescape(user.bio) : ''), [user.bio]);

  return (
    <StyledUserGalleryHeader>
      <StyledUsernameWrapper>
        <StyledUsername>{user.username}</StyledUsername>
        <StyledButtonsWrapper>
          {showLinkButton && <LinkButton username={user.username} />}
          {showQRCode && <QRCode username={user.username} />}
          {showMobileLayoutToggle && (
            <MobileLayoutToggle mobileLayout={mobileLayout} setMobileLayout={setMobileLayout} />
          )}
        </StyledButtonsWrapper>
      </StyledUsernameWrapper>
      <Spacer height={16} />
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

const StyledButtonsWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 36px;
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
