import { useMemo } from 'react';
import styled from 'styled-components';
import unescape from 'utils/unescape';
import { Subdisplay, BodyRegular, TitleL } from 'components/core/Text/Text';
import Spacer from 'components/core/Spacer/Spacer';
import colors from 'components/core/colors';
import Markdown from 'components/core/Markdown/Markdown';
import MobileLayoutToggle from './MobileLayoutToggle';
import { DisplayLayout } from 'components/core/enums';
import breakpoints from 'components/core/breakpoints';

type Props = {
  username: string;
  bio: string;
  showMobileLayoutToggle: boolean;
  mobileLayout: DisplayLayout;
  setMobileLayout: (mobileLayout: DisplayLayout) => void;
};

function UserGalleryHeader({
  username,
  bio,
  showMobileLayoutToggle,
  mobileLayout,
  setMobileLayout,
}: Props) {
  const unescapedBio = useMemo(() => unescape(bio), [bio]);

  return (
    <StyledUserGalleryHeader>
      <StyledUsernameWrapper>
        <StyledUsername>{username}</StyledUsername>
        {showMobileLayoutToggle && (
          <MobileLayoutToggle mobileLayout={mobileLayout} setMobileLayout={setMobileLayout} />
        )}
      </StyledUsernameWrapper>
      <Spacer height={8} />
      <StyledUserDetails>
        <StyledBio color={colors.gray50}>
          <Markdown text={unescapedBio} />
        </StyledBio>
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

const StyledBio = styled(BodyRegular)`
  /* ensures linebreaks are reflected in UI */
  white-space: pre-line;
`;

export default UserGalleryHeader;
