import { memo, ReactElement } from 'react';
import styled from 'styled-components';
import breakpoints, { pageGutter } from 'components/core/breakpoints';
import { graphql, useFragment } from 'react-relay';
import { GlobalNavbarFragment$key } from '__generated__/GlobalNavbarFragment.graphql';
import RightContent from './RightContent';
import LeftContent from './LeftContent';

export type Props = {
  queryRef: GlobalNavbarFragment$key;
  customLeftContent: ReactElement | null;
};

function GlobalNavbar({ queryRef, customLeftContent }: Props) {
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
      {customLeftContent ? (
        <LeftContent content={customLeftContent} />
      ) : (
        // display an empty div here if there's no left content; otherwise,
        // the `RightContent` component will appear on the left side
        <div />
      )}
      <RightContent queryRef={query} />
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

export default memo(GlobalNavbar);
