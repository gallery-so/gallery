import styled, { CSSProperties } from 'styled-components';

export const HStack = styled.div<{
  gap: number;

  alignItems?: CSSProperties['alignItems'];
  justifyContent?: CSSProperties['justifyContent'];
}>`
  display: flex;

  gap: 0 ${({ gap }) => gap}px;

  ${({ alignItems }) => (alignItems ? `align-items: ${alignItems};` : '')};
  ${({ justifyContent }) => (justifyContent ? `justify-content: ${justifyContent};` : '')};
`;
