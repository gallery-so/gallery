import { ReactNode } from 'react';
import styled from 'styled-components';
import { GLOBAL_FOOTER_HEIGHT, GLOBAL_NAVBAR_HEIGHT } from './constants';

type Props = {
  className?: string;
  centered?: boolean;
  children: ReactNode | ReactNode[];
};

function Page({
  className,
  centered = false,
  children,
}: Props) {
  return (
    <StyledPage
      className={className}
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

  min-height: calc(100vh - ${GLOBAL_FOOTER_HEIGHT}px - ${GLOBAL_NAVBAR_HEIGHT}px);
`;

export default Page;
