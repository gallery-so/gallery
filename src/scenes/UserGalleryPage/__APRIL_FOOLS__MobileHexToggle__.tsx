import { useCallback } from 'react';
import styled from 'styled-components';
import { __APRIL_FOOLS_HexToggleProps__ } from './__APRIL_FOOLS__DesktopHexToggle__';

export const __APRIL_FOOLS__MobileHexToggle__ = ({
  __APRIL_FOOLS__hexEnabled__,
  __APRIL_FOOLS__setHexEnabled__,
}: __APRIL_FOOLS_HexToggleProps__) => {
  const handleClick = useCallback(() => {
    __APRIL_FOOLS__setHexEnabled__(!__APRIL_FOOLS__hexEnabled__);
  }, [__APRIL_FOOLS__hexEnabled__]);

  return (
    <StyledAprilFoolsMobileHexToggle
      onClick={handleClick}
      __APRIL_FOOLS__hexEnabled__={__APRIL_FOOLS__hexEnabled__}
    >
      {__APRIL_FOOLS__hexEnabled__ ? (
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M19 1H1V19H19V1Z" stroke="#707070" />
        </svg>
      ) : (
        <svg
          width="20"
          height="22"
          viewBox="0 0 20 22"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M10 0.599998L1 5.8V16.2L10 21.4L19 16.2V5.8L10 0.599998Z" stroke="#707070" />
        </svg>
      )}
    </StyledAprilFoolsMobileHexToggle>
  );
};

const StyledAprilFoolsMobileHexToggle = styled.div<{ __APRIL_FOOLS__hexEnabled__: boolean }>`
  margin-top: ${({ __APRIL_FOOLS__hexEnabled__ }) =>
    __APRIL_FOOLS__hexEnabled__ ? '8px' : '10px'};
  cursor: pointer;

  &:hover {
    path {
      stroke: #141414;
    }
  }
`;
