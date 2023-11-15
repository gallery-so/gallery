import { FloatingPortal, Strategy } from '@floating-ui/react';
import { motion } from 'framer-motion';
import React from 'react';
import styled from 'styled-components';

import {
  ANIMATED_COMPONENT_TRANSITION_S,
  ANIMATED_COMPONENT_TRANSLATION_PIXELS_SMALL,
  rawTransitions,
} from '../core/transitions';

type FloatingCardProps = {
  className: string;
  headingId: string;
  floatingRef: (node: HTMLElement | null) => void;
  strategy: Strategy;
  x: number | null;
  y: number | null;
  getFloatingProps: () => object;
  children: React.ReactNode;
};

export function FloatingCard({
  className,
  headingId,
  floatingRef,
  strategy,
  x,
  y,
  getFloatingProps,
  children,
}: FloatingCardProps) {
  return (
    <FloatingPortal preserveTabOrder={false}>
      <StyledCardWrapper
        className={className}
        aria-labelledby={headingId}
        ref={floatingRef}
        style={{
          position: strategy,
          top: y ?? 0,
          left: x ?? 0,
        }}
        {...getFloatingProps()}
        transition={{
          duration: ANIMATED_COMPONENT_TRANSITION_S,
          ease: rawTransitions.cubicValues,
        }}
        initial={{ opacity: 0, y: 0 }}
        animate={{ opacity: 1, y: ANIMATED_COMPONENT_TRANSLATION_PIXELS_SMALL }}
        exit={{ opacity: 0, y: 0 }}
      >
        {children}
      </StyledCardWrapper>
    </FloatingPortal>
  );
}

const StyledCardWrapper = styled(motion.div)`
  z-index: 14;

  :focus {
    outline: none;
  }
`;
