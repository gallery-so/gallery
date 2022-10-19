import { memo, ReactElement } from 'react';
import styled from 'styled-components';
import breakpoints, { pageGutter } from 'components/core/breakpoints';
import CenterContent from './CenterContent';

export type Props = {
  customLeftContent: ReactElement | null;
  customCenterContent: ReactElement | null;
  customRightContent: ReactElement | null;
};

function GlobalNavbar({ customLeftContent, customCenterContent, customRightContent }: Props) {
  return (
    <StyledGlobalNavbar className="GlobalNavbar" data-testid="navbar">
      <StyledContentWrapperLeft>{customLeftContent}</StyledContentWrapperLeft>
      <StyledContentWrapper>
        <CenterContent content={customCenterContent} />
      </StyledContentWrapper>
      <StyledContentWrapperRight>{customRightContent}</StyledContentWrapperRight>
    </StyledGlobalNavbar>
  );
}

const StyledGlobalNavbar = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;

  // TODO: standardize these settings
  background: rgba(254, 254, 254, 0.95);
  backdrop-filter: blur(48px);

  position: fixed;
  z-index: 3;

  padding: 12px ${pageGutter.mobile}px;

  @media only screen and ${breakpoints.tablet} {
    padding: 12px ${pageGutter.tablet}px;
  }
`;

const StyledContentWrapper = styled.div`
  display: flex;
  flex: 1;
  justify-content: center;
`;

const StyledContentWrapperLeft = styled(StyledContentWrapper)`
  justify-content: flex-start;
`;

const StyledContentWrapperRight = styled(StyledContentWrapper)`
  justify-content: flex-end;
`;

export default memo(GlobalNavbar);
