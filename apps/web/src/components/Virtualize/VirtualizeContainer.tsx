import { Virtualizer } from '@tanstack/react-virtual';
import { ForwardedRef, forwardRef, PropsWithChildren } from 'react';
import styled from 'styled-components';

type Props = PropsWithChildren<{
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  virtualizer: Virtualizer<any, any>;
  className?: string;
}>;

function VirtualizedContainer(
  { virtualizer, className, children }: Props,
  ref: ForwardedRef<HTMLDivElement>
) {
  const yPosition = virtualizer.getVirtualItems()[0]?.start ?? 0;

  return (
    <Container ref={ref} className={className} style={{ height: virtualizer.getTotalSize() }}>
      <ScrollArea
        style={{ transform: `translateY(${yPosition - virtualizer.options.scrollMargin}px)` }}
      >
        {children}
      </ScrollArea>
    </Container>
  );
}

const Container = styled.div`
  width: 100%;
  position: relative;
`;

const ScrollArea = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
`;

export default forwardRef(VirtualizedContainer);
