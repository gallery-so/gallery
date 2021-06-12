import { ReactNode } from 'react';
import styled from 'styled-components';
import { FOOTER_HEIGHT_PX } from './Footer';

type Props = {
  className?: string;
  withRoomForFooter?: boolean;
  centered?: boolean;
  children: ReactNode | ReactNode[];
};

function Page({
  className,
  withRoomForFooter = true,
  centered = false,
  children,
}: Props) {
  return (
    <StyledPage
      className={className}
      withRoomForFooter={withRoomForFooter}
      centered={centered}
    >
      {children}
    </StyledPage>
  );
}

export const fullPageHeightWithoutFooter = `calc(100vh - ${FOOTER_HEIGHT_PX}px)`;

const StyledPage = styled.div<Props>`
  display: flex;
  flex-direction: column;
  align-items: ${({ centered }) => (centered ? 'center' : undefined)};
  justify-content: ${({ centered }) => (centered ? 'center' : undefined)};
  min-height: ${({ withRoomForFooter }) =>
    withRoomForFooter ? fullPageHeightWithoutFooter : '100vh'};
`;

export default Page;
