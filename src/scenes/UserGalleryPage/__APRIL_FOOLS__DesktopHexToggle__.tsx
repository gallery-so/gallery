import { ReactNode, useCallback } from 'react';
import styled from 'styled-components';

export type __APRIL_FOOLS_HexToggleProps__ = {
  __APRIL_FOOLS__hexEnabled__: boolean;
  __APRIL_FOOLS__setHexEnabled__: (hexEnabled: boolean) => void;
};

type __APRIL_FOOLS_ContainerProps__ = {
  active: boolean;
  children: ReactNode;
  onClick: () => void;
};

const __APRIL_FOOLS_ICON_CONTAINER__ = ({
  active,
  onClick,
  children,
}: __APRIL_FOOLS_ContainerProps__) => (
  <StyledAprilFoolsIconContainer onClick={onClick} active={active}>
    {children}
  </StyledAprilFoolsIconContainer>
);

const StyledAprilFoolsIconContainer = styled.div<{ active: boolean }>`
  height: 24px;
  width: 24px;
  border: 1px solid #e2e2e2;
  display: flex;
  justify-content: center;
  align-items: center;

  background: ${({ active }) => (active ? '#e2e2e2' : 'transparent')};
`;

export const __APRIL_FOOLS__DesktopHexToggle__ = ({
  className,
  __APRIL_FOOLS__hexEnabled__,
  __APRIL_FOOLS__setHexEnabled__,
}: { className?: string } & __APRIL_FOOLS_HexToggleProps__) => {
  const handleHexClick = useCallback(() => {
    __APRIL_FOOLS__setHexEnabled__(true);
  }, []);

  const handleSquareClick = useCallback(() => {
    __APRIL_FOOLS__setHexEnabled__(false);
  }, []);

  return (
    <__APRIL_FOOLS_CONTAINER__ className={className}>
      <__APRIL_FOOLS_ICON_CONTAINER__ onClick={handleHexClick} active={__APRIL_FOOLS__hexEnabled__}>
        <svg
          width="14"
          height="14"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M2.5 11.1781V4.82189L8 1.64411L13.5 4.82189V11.1781L8 14.3559L2.5 11.1781Z"
            stroke={__APRIL_FOOLS__hexEnabled__ ? '#141414' : '#707070'}
          />
        </svg>
      </__APRIL_FOOLS_ICON_CONTAINER__>
      <__APRIL_FOOLS_ICON_CONTAINER__
        onClick={handleSquareClick}
        active={!__APRIL_FOOLS__hexEnabled__}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M2.5 13.5V2.5H13.5V13.5H2.5Z"
            stroke={__APRIL_FOOLS__hexEnabled__ ? '#707070' : '#141414'}
          />
        </svg>
      </__APRIL_FOOLS_ICON_CONTAINER__>
    </__APRIL_FOOLS_CONTAINER__>
  );
};

const __APRIL_FOOLS_CONTAINER__ = styled.div`
  display: flex;
  cursor: pointer;
`;
