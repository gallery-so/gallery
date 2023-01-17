import {
  autoUpdate,
  offset,
  shift,
  useFloating,
  useHover,
  useInteractions,
} from '@floating-ui/react';
import { useMemo, useState } from 'react';
import { CSSProperties } from 'styled-components';

export function useTooltipHover() {
  const [open, setOpen] = useState(false);

  const { x, y, reference, floating, strategy, context } = useFloating({
    open,
    placement: 'bottom',
    strategy: 'absolute',
    onOpenChange: setOpen,
    middleware: [offset(8), shift()],
    whileElementsMounted: autoUpdate,
  });

  const hover = useHover(context);
  const { getReferenceProps, getFloatingProps } = useInteractions([hover]);

  const floatingStyle: CSSProperties = useMemo(
    () => ({
      position: strategy,
      top: y ?? 0,
      left: x ?? 0,
      transform: open ? `translateY(0)` : `translateY(-4px)`,
      opacity: open ? '1' : '0',
      width: 'max-content',
      zIndex: 10,
    }),
    [open, strategy, x, y]
  );

  return useMemo(
    () => ({
      getReferenceProps,
      getFloatingProps,
      floatingStyle,
      reference,
      floating,
      open,
    }),
    [floating, floatingStyle, getFloatingProps, getReferenceProps, reference, open]
  );
}
