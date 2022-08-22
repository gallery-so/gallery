import styled from 'styled-components';
import colors from 'src/components/core/colors';
import { RefreshIcon } from '../../icons/RefreshIcon';
import Spacer from 'components/core/Spacer/Spacer';
import { BaseM } from 'components/core/Text/Text';
import { MouseEventHandler, useCallback } from 'react';

type Size = 'tiny' | 'medium';

type Props = {
  onClick: () => void;
  refreshing: boolean;
  size?: Size;
};

export function NftFailureFallback({ onClick, refreshing, size = 'medium' }: Props) {
  const handleClick = useCallback(() => {
    if (refreshing) {
      return;
    }

    onClick();
  }, [onClick, refreshing]);

  const spaceY = {
    tiny: 4,
    medium: 16,
  }[size];

  return (
    <Wrapper onClick={handleClick}>
      {refreshing ? (
        <Label size={size}>Loading...</Label>
      ) : (
        <Label size={size}>Could not load</Label>
      )}
      <Spacer height={spaceY} />
      <IconButton>
        <RefreshIcon />
      </IconButton>
    </Wrapper>
  );
}

const Label = styled(BaseM)<{ size: Size }>`
  color: ${colors.metal};

  ${({ size }) => (size === 'tiny' ? 'font-size: 10px;' : '')}
  ${({ size }) => (size === 'tiny' ? 'line-height: 12px;' : '')}
`;

const IconButton = styled.div`
  display: flex;
  background: transparent;
`;

const Wrapper = styled.button`
  cursor: pointer;

  // Button resets
  border: none;
  margin: 0;
  // padding: 8px 16px;

  width: 100%;

  aspect-ratio: 1;

  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  background-color: ${colors.offWhite};
`;
