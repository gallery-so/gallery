import styled from 'styled-components';
import colors from 'components/core/colors';
import { RefreshIcon } from 'icons/RefreshIcon';
import Spacer from 'components/core/Spacer/Spacer';
import { BaseM } from 'components/core/Text/Text';
import { MouseEventHandler, useCallback, useEffect, useState } from 'react';
import Tooltip from 'components/Tooltip/Tooltip';
import IconContainer from 'components/core/Markdown/IconContainer';

type Size = 'tiny' | 'medium';

type Props = {
  size?: Size;
  onRetry: () => void;
  refreshing: boolean;
};

export function NftFailureFallback({ onRetry, refreshing, size = 'medium' }: Props) {
  const handleClick = useCallback(() => {
    if (refreshing) {
      return;
    }

    onRetry?.();
  }, [onRetry, refreshing]);

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
      <Wrapper>
        {refreshing ? (
          <Label size={size}>Loading...</Label>
        ) : (
          <Label size={size}>Could not load</Label>
        )}
        {!refreshing && (
          <>
            <Spacer height={spaceY} />
            <IconButton
              data-testid="RefreshButton"
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
              refreshing={refreshing}
              onMouseDown={handleMouseDown}
              onClick={handleClick}
            >
              <IconContainer icon={<RefreshIcon />} />
              <RefreshTooltip active={showTooltip} text="Refresh" />
            </IconButton>
          </>
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

const Label = styled(BaseM)<{ size: Size }>`
  color: ${colors.metal};
  text-align: center;

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
const Wrapper = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;

  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  background-color: ${colors.offWhite};
`;
