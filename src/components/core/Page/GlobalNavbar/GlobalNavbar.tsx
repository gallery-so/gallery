import { memo } from 'react';
import styled from 'styled-components';
import breakpoints, { pageGutter } from 'components/core/breakpoints';
import { GLOBAL_NAVBAR_HEIGHT } from '../constants';
import LoggedOutNav from './LoggedOutNav';
import LoggedInNav from './LoggedInNav';
import { graphql, useFragment } from 'react-relay';
import { GlobalNavbarFragment$key } from '__generated__/GlobalNavbarFragment.graphql';

type Props = {
  queryRef: GlobalNavbarFragment$key;
};

function GlobalNavbar({ queryRef }: Props) {
  const query = useFragment(
    graphql`
      fragment GlobalNavbarFragment on Query {
        ...LoggedInNavFragment

        viewer {
          ... on Viewer {
            user {
              id
            }
          }
        }
      }
    `,
    queryRef
  );

  const isAuthenticated = Boolean(query.viewer?.user?.id);

  return (
    <StyledGlobalNavbar data-testid="navbar">
      {isAuthenticated ? <LoggedInNav queryRef={query} /> : <LoggedOutNav />}
    </StyledGlobalNavbar>
  );
}

const StyledGlobalNavbar = styled.div`
  width: 100%;
  height: ${GLOBAL_NAVBAR_HEIGHT}px;
  display: flex;
  justify-content: flex-end;

  position: relative;
  z-index: 3;

  padding: 0 ${pageGutter.mobile}px;

  @media only screen and ${breakpoints.tablet} {
    padding: 0 ${pageGutter.tablet}px;
  }
`;

export default memo(GlobalNavbar);
