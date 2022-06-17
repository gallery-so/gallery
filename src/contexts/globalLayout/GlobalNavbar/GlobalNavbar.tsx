import { memo, ReactElement } from 'react';
import styled from 'styled-components';
import breakpoints, { pageGutter } from 'components/core/breakpoints';
import { graphql, useFragment } from 'react-relay';
import { GlobalNavbarFragment$key } from '__generated__/GlobalNavbarFragment.graphql';
import RightContent from './RightContent';
import LeftContent from './LeftContent';
// TODO maybe combine with LeftContent
import CenterContent from './CenterContent';
import NavbarGLink from 'components/NavbarGLink';

export type Props = {
  queryRef: GlobalNavbarFragment$key;
  customLeftContent: ReactElement | null;
  customCenterContent: ReactElement | null;
};

function GlobalNavbar({ queryRef, customLeftContent, customCenterContent }: Props) {
  const query = useFragment(
    graphql`
      fragment GlobalNavbarFragment on Query {
        ...RightContentFragment
      }
    `,
    queryRef
  );

  return (
    <StyledGlobalNavbar data-testid="navbar">
      <StyledContentWrapperLeft>
        {customLeftContent && <LeftContent content={customLeftContent} />}
      </StyledContentWrapperLeft>
      <StyledContentWrapper>
        <CenterContent content={customCenterContent || <NavbarGLink />} />
      </StyledContentWrapper>
      <StyledContentWrapperRight>
        <RightContent queryRef={query} />
      </StyledContentWrapperRight>
    </StyledGlobalNavbar>
  );
}

export const GLOBAL_NAVBAR_HEIGHT = 64;

const StyledGlobalNavbar = styled.div`
  width: 100%;
  height: ${GLOBAL_NAVBAR_HEIGHT}px;
  display: flex;
  justify-content: space-between;
  align-items: center;

  // TODO: standardize these settings
  background: rgba(254, 254, 254, 0.95);
  backdrop-filter: blur(48px);

  position: fixed;
  z-index: 3;

  padding: 0 ${pageGutter.mobile}px;

  @media only screen and ${breakpoints.tablet} {
    padding: 0 ${pageGutter.tablet}px;
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
