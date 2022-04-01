import { ReactNode, useCallback, useMemo } from 'react';
import styled from 'styled-components';
import unescape from 'utils/unescape';
import { Subdisplay, BodyRegular } from 'components/core/Text/Text';
import Spacer from 'components/core/Spacer/Spacer';
import colors from 'components/core/colors';
import Markdown from 'components/core/Markdown/Markdown';
import MobileLayoutToggle from './MobileLayoutToggle';
import { DisplayLayout } from 'components/core/enums';
import breakpoints from 'components/core/breakpoints';
import {
  __APRIL_FOOLS_HexToggleProps__,
  __APRIL_FOOLS__DesktopHexToggle__,
} from './__APRIL_FOOLS__DesktopHexToggle__';
import { __APRIL_FOOLS__MobileHexToggle__ } from './__APRIL_FOOLS__MobileHexToggle__';

type Props = {
  username: string;
  bio: string;
  showMobileLayoutToggle: boolean;
  mobileLayout: DisplayLayout;
  setMobileLayout: (mobileLayout: DisplayLayout) => void;
} & __APRIL_FOOLS_HexToggleProps__;

function UserGalleryHeader({
  username,
  bio,
  showMobileLayoutToggle,
  mobileLayout,
  setMobileLayout,
  __APRIL_FOOLS__hexEnabled__,
  __APRIL_FOOLS__setHexEnabled__,
}: Props) {
  const unescapedBio = useMemo(() => unescape(bio), [bio]);

  return (
    <StyledUserGalleryHeader>
      <StyledUsernameWrapper>
        <StyledUsername>{username}</StyledUsername>
        {showMobileLayoutToggle ? (
          <ToggleGroup>
            <div>
              <Spacer height={4} />
              <__APRIL_FOOLS__MobileHexToggle__
                __APRIL_FOOLS__hexEnabled__={__APRIL_FOOLS__hexEnabled__}
                __APRIL_FOOLS__setHexEnabled__={__APRIL_FOOLS__setHexEnabled__}
              />
            </div>
            <Spacer width={16} />
            <MobileLayoutToggle mobileLayout={mobileLayout} setMobileLayout={setMobileLayout} />
          </ToggleGroup>
        ) : (
          <__APRIL_FOOLS__DesktopHexToggle__
            __APRIL_FOOLS__hexEnabled__={__APRIL_FOOLS__hexEnabled__}
            __APRIL_FOOLS__setHexEnabled__={__APRIL_FOOLS__setHexEnabled__}
          />
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

const ToggleGroup = styled.div`
  display: flex;
  align-items: center;
  height: 36px;
`;

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

const StyledUsername = styled(Subdisplay)`
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
