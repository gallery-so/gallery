import { PropsWithChildren } from 'react';
import styled from 'styled-components';

import breakpoints, { pageGutter } from '~/components/core/breakpoints';
import { VStack } from '~/components/core/Spacer/Stack';
import { useGlobalNavbarHeight } from '~/contexts/globalLayout/GlobalNavbar/useGlobalNavbarHeight';

export const FeedSpacing = styled(VStack)`
  width: 100%;
  flex: 1;
  @media only screen and ${breakpoints.tablet} {
    padding-top: 24px;
  }
`;

export function FeedPage({ children }: PropsWithChildren) {
  const navbarHeight = useGlobalNavbarHeight();

  return (
    <Page navbarHeight={navbarHeight}>
      <FeedSpacing>{children}</FeedSpacing>
    </Page>
  );
}

const Page = styled.div<{ navbarHeight: number }>`
  display: flex;
  flex-direction: column;

  padding-top: ${({ navbarHeight }) => navbarHeight}px;
  min-height: 100vh;

  margin-left: ${pageGutter.mobile}px;
  margin-right: ${pageGutter.mobile}px;
  justify-content: flex-start;
  align-items: center;
  max-width: 100vw;

  @media only screen and ${breakpoints.tablet} {
    margin-left: ${pageGutter.tablet}px;
    margin-right: ${pageGutter.tablet}px;
  }

  @media only screen and ${breakpoints.desktop} {
    max-width: 1336px;
    margin: 0 auto;
    padding: ${({ navbarHeight }) => navbarHeight}px 32px 0;
  }
`;
