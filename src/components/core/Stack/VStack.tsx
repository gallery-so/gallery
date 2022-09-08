import styled, { CSSProperties } from 'styled-components';

export const VStack = styled.div<{
  gap?: number;

  alignItems?: CSSProperties['alignItems'];
  justifyContent?: CSSProperties['justifyContent'];
}>`
  display: flex;
  flex-direction: column;

  gap: ${({ gap }) => gap ?? 0}px 0;

  ${({ alignItems }) => (alignItems ? `align-items: ${alignItems};` : '')};
  ${({ justifyContent }) => (justifyContent ? `justify-content: ${justifyContent};` : '')};
`;
