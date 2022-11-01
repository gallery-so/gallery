import { ReactNode } from 'react';
import styled, { css } from 'styled-components';
import { FOOTER_HEIGHT } from 'components/Onboarding/constants';
import GalleryRoute from 'scenes/_Router/GalleryRoute';
import colors from 'components/core/colors';
import { useGlobalNavbarHeight } from 'contexts/globalLayout/GlobalNavbar/useGlobalNavbarHeight';

type Props = {
  children: ReactNode | ReactNode[];
  // If this is true, the page height will be reduced to account for the footer height
  withFooter?: boolean;
  navbar?: JSX.Element | false;
  withBorder?: boolean;
};

/**
 * A helper component to easily generate full-page steps where the content is centered
 */
export default function FullPageStep({ children, withFooter, withBorder, navbar }: Props) {
  const globalNavbarHeight = useGlobalNavbarHeight();

  return (
    <GalleryRoute
      element={
        <StyledPage
          withFooter={withFooter}
          withHeader={Boolean(navbar)}
          withBorder={withBorder}
          navbarHeight={globalNavbarHeight}
        >
          {children}
        </StyledPage>
      }
      navbar={navbar ?? false}
      footer={false}
    />
  );
}

const StyledPage = styled.div<{
  withFooter?: boolean;
  withHeader?: boolean;
  withBorder?: boolean;
  navbarHeight: number;
}>`
  display: flex;
  flex-direction: column;
  height: calc(
    100vh -
      ${({ withFooter, withHeader, navbarHeight, withBorder }) => {
        let heightToRemove = 0;

        if (withFooter) {
          heightToRemove += FOOTER_HEIGHT;
        }

        if (withHeader) {
          heightToRemove += navbarHeight;
        }

        if (withBorder) {
          heightToRemove += 1;
        }

        return heightToRemove;
      }}px
  );

  ${({ withBorder }) =>
    withBorder
      ? css`
          border-top: 1px solid ${colors.porcelain};
        `
      : null}

  ${({ withHeader, navbarHeight }) =>
    withHeader
      ? css`
          position: relative;
          top: ${navbarHeight}px;
        `
      : null}
`;
