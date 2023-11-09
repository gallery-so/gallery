import { MouseEventHandler, useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';

import IconContainer from '~/components/core/IconContainer';
import { VStack } from '~/components/core/Spacer/Stack';
import { BaseM } from '~/components/core/Text/Text';
import Tooltip from '~/components/Tooltip/Tooltip';
import { useNftRetry } from '~/hooks/useNftRetry';
import { RefreshIcon } from '~/icons/RefreshIcon';
import colors from '~/shared/theme/colors';

type Size = 'tiny' | 'medium';

export type NftFailureFallbackProps = {
  size?: Size;
  tokenId: string;
};

export function NftFailureFallback({ tokenId, size = 'medium' }: NftFailureFallbackProps) {
  const { refreshingMetadata: refreshing, refreshMetadata: onRetry } = useNftRetry({
    tokenId,
  });

  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
      event.preventDefault();
      if (refreshing) {
        return;
      }

      onRetry?.();
    },
    [onRetry, refreshing]
  );

  const handleMouseDown = useCallback<MouseEventHandler>((event) => {
    // Have to do this to stop messing with Drag & Drop stuff
    event.preventDefault();
  }, []);

  const spaceY = {
    tiny: 0,
    medium: 16,
  }[size];

  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(
    // When you click the refresh icon, the element disappears.
    // Therefore, we never get an onMouseLeave event to reset
    // the tooltip state.
    //
    // This should ensure we reset the tooltip state when a refresh begins.
    function resetTooltipWhenRefreshing() {
      if (refreshing) {
        setShowTooltip(false);
      }
    },
    [refreshing]
  );

  return (
    <AspectRatioWrapper>
      <Wrapper data-tokenid={tokenId} gap={spaceY} align="center" justify="center">
        {refreshing ? (
          <NftFallbackLabel size={size}>Loading...</NftFallbackLabel>
        ) : (
          <NftFallbackLabel size={size}>Could not load</NftFallbackLabel>
        )}
        {!refreshing && (
          <IconButton
            data-testid="RefreshButton"
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            refreshing={refreshing}
            onMouseDown={handleMouseDown}
            onClick={handleClick}
          >
            <IconContainer variant="default" size="sm" icon={<RefreshIcon />} />
            <RefreshTooltip active={showTooltip} text="Refresh" />
          </IconButton>
        )}
      </Wrapper>
    </AspectRatioWrapper>
  );
}

const RefreshTooltip = styled(Tooltip)<{ active: boolean }>`
  top: 0;
  opacity: ${({ active }) => (active ? 1 : 0)};
  transform: translateY(calc(-100% + ${({ active }) => (active ? -4 : 0)}px));
`;

export const NftFallbackLabel = styled(BaseM)<{ size: Size }>`
  color: ${colors.metal};
  text-align: center;
  pointer-events: none;

  ${({ size }) => (size === 'tiny' ? 'font-size: 10px;' : '')}
  ${({ size }) => (size === 'tiny' ? 'line-height: 12px;' : '')}
`;

const IconButton = styled.button<{ refreshing: boolean }>`
  position: relative;

  // Button Reset
  border: none;
  margin: 0;
  padding: 0;
  background: none;

  cursor: pointer;

  // ensure the refresh icon is clickable over other elements
  z-index: 2;
`;

// No support for aspect-ratio trick
// https://css-tricks.com/aspect-ratio-boxes/
const AspectRatioWrapper = styled.div`
  width: 100%;
  height: 0;
  padding-bottom: 100%;
  position: relative;
`;

// No support for aspect-ratio trick
// https://css-tricks.com/aspect-ratio-boxes/
const Wrapper = styled(VStack)`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;

  background-color: ${colors.offWhite};
`;
