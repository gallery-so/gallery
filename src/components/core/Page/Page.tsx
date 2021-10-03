import { ReactNode } from 'react';
import styled from 'styled-components';
import { GLOBAL_FOOTER_HEIGHT, GLOBAL_NAVBAR_HEIGHT } from './constants';

type Props = {
  className?: string;
  withNavbarInView?: boolean;
  withFooterInView?: boolean;
  centered?: boolean;
  children: ReactNode | ReactNode[];
};

function Page({
  className,
  withNavbarInView = true,
  withFooterInView = true,
  centered = false,
  children,
}: Props) {
  return (
    <StyledPage
      className={className}
      withNavbarInView={withNavbarInView}
      withFooterInView={withFooterInView}
      centered={centered}
    >
      {children}
    </StyledPage>
  );
}

const StyledPage = styled.div<Props>`
  display: flex;
  flex-direction: column;
  align-items: ${({ centered }) => (centered ? 'center' : undefined)};
  justify-content: ${({ centered }) => (centered ? 'center' : undefined)};

  padding-top: ${({ withNavbarInView }) => `${withNavbarInView ? 0 : 80}px`};
  min-height: ${({ withFooterInView, withNavbarInView }) => `
    calc(100vh - ${withFooterInView ? GLOBAL_FOOTER_HEIGHT : 0}px - ${withNavbarInView ? GLOBAL_NAVBAR_HEIGHT : 0}px)
  `};
`;

export default Page;
