import { ReactNode } from 'react';
import { Filler } from 'scenes/_Router/GalleryRoute';
import styled from 'styled-components';
import { GLOBAL_FOOTER_HEIGHT, GLOBAL_NAVBAR_HEIGHT } from './constants';

type Props = {
  className?: string;
  centered?: boolean;
  // simulates navbar filler if being used for rendering a page outside of GalleryRoute
  topPadding?: boolean;
  // forces page to take up the screen height exactly
  fixedFullPageHeight?: boolean;
  children: ReactNode | ReactNode[];
};

function Page({
  className,
  centered = false,
  topPadding = false,
  fixedFullPageHeight = false,
  children,
}: Props) {
  return (
    <>
      {topPadding ? <Filler /> : null}
      <StyledPage
        className={className}
        centered={centered}
        fixedFullPageHeight={fixedFullPageHeight}
      >
        {children}
      </StyledPage>
    </>
  );
}

const StyledPage = styled.div<Props>`
  display: flex;
  flex-direction: column;
  align-items: ${({ centered }) => (centered ? 'center' : undefined)};
  justify-content: ${({ centered }) => (centered ? 'center' : undefined)};

  ${({ fixedFullPageHeight }) =>
    fixedFullPageHeight ? 'height' : 'min-height'}: calc(
    100vh - ${GLOBAL_FOOTER_HEIGHT}px - ${GLOBAL_NAVBAR_HEIGHT}px
  );
`;

export default Page;
