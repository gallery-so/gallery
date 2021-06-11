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

const StyledPage = styled.div<Props>`
  display: flex;
  flex-direction: column;
  align-items: ${({ centered }) => (centered ? 'center' : undefined)};
  justify-content: ${({ centered }) => (centered ? 'center' : undefined)};
  min-height: calc(
    100vh -
      ${({ withRoomForFooter }) => (withRoomForFooter ? FOOTER_HEIGHT_PX : 0)}px
  );
`;

export default Page;
