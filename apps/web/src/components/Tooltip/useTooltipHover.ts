import {
  autoUpdate,
  offset,
  OffsetOptions,
  Placement,
  shift,
  useFloating,
  useHover,
  useInteractions,
} from '@floating-ui/react';
import { useMemo, useState } from 'react';
import { CSSProperties } from 'styled-components';

type useTooltipHoverOptions = {
  disabled?: boolean;
  placement?: Placement;
  forceDisplay?: boolean;

  offsetOptions?: OffsetOptions;
};

export function useTooltipHover(options?: useTooltipHoverOptions, offsetOptions = 8) {
  const [_open, setOpen] = useState(false);
  const open = options?.disabled ? false : _open;

  const { x, y, reference, floating, strategy, context } = useFloating({
    open,
    placement: options?.placement ?? 'bottom',
    strategy: 'absolute',
    onOpenChange: setOpen,
    middleware: [offset(offsetOptions), shift()],
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
      opacity: open ? '1' : options?.forceDisplay ? '1' : '0',
      width: 'max-content',
      zIndex: 10,
    }),
    [open, options?.forceDisplay, strategy, x, y]
  );

  return useMemo(
    () => ({
      getReferenceProps,
      getFloatingProps,
      floatingStyle,
      reference,
      floating,
      open,
      close: () => setOpen(false),
    }),
    [floating, floatingStyle, getFloatingProps, getReferenceProps, reference, open]
  );
}
