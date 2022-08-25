import styled from 'styled-components';
import colors from 'components/core/colors';
import { RefreshIcon } from '../../icons/RefreshIcon';
import Spacer from 'components/core/Spacer/Spacer';
import { BaseM } from 'components/core/Text/Text';
import { MouseEventHandler, useCallback } from 'react';

type Size = 'tiny' | 'medium';

type Props = {
  size?: Size;
} & (
  | { noControls: true; onRetry?: undefined; refreshing?: undefined }
  | { noControls?: false; onRetry: () => void; refreshing: boolean }
);

export function NftFailureFallback({ noControls, onRetry, refreshing, size = 'medium' }: Props) {
  const handleClick = useCallback(() => {
    if (noControls) {
      return;
    }

    if (refreshing) {
      return;
    }

    onRetry?.();
  }, [noControls, onRetry, refreshing]);

  const handleMouseDown = useCallback<MouseEventHandler>((event) => {
    // Have to do this to stop messing with Drag & Drop stuff
    event.preventDefault();
  }, []);

  const spaceY = {
    tiny: 4,
    medium: 16,
  }[size];

  return (
    <Wrapper>
      {refreshing ? (
        <Label size={size}>Loading...</Label>
      ) : (
        <Label size={size}>Could not load</Label>
      )}
      {!noControls && (
        <>
          <Spacer height={spaceY} />
          <IconButton onMouseDown={handleMouseDown} onClick={handleClick}>
            <RefreshIcon />
          </IconButton>
        </>
      )}
    </Wrapper>
  );
}

const Label = styled(BaseM)<{ size: Size }>`
  color: ${colors.metal};

  ${({ size }) => (size === 'tiny' ? 'font-size: 10px;' : '')}
  ${({ size }) => (size === 'tiny' ? 'line-height: 12px;' : '')}
`;

const IconButton = styled.button`
  display: flex;
  background: transparent;

  border: none;
  margin: 0;
  padding: 8px;

  cursor: pointer;

  &:hover {
    background-color: ${colors.faint};
  }
`;

const Wrapper = styled.div`
  cursor: pointer;

  width: 100%;
  aspect-ratio: 1;

  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  background-color: ${colors.offWhite};
`;
