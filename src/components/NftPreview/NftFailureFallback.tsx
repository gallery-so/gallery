import styled from 'styled-components';
import colors from 'src/components/core/colors';
import { RefreshIcon } from '../../icons/RefreshIcon';
import Spacer from 'components/core/Spacer/Spacer';
import { BaseM } from 'components/core/Text/Text';
import { useCallback } from 'react';

type Props = {
  onClick: () => void;
  refreshing: boolean;
};

export function NftFailureFallback({ onClick, refreshing }: Props) {
  const handleClick = useCallback(() => {
    if (refreshing) {
      return;
    }

    onClick();
  }, [onClick, refreshing]);

  return (
    <Wrapper onClick={handleClick}>
      {refreshing ? <Label>Loading...</Label> : <Label>Could not load</Label>}
      <Spacer height={16} />
      <IconButton>
        <RefreshIcon />
      </IconButton>
    </Wrapper>
  );
}

const Label = styled(BaseM)`
  color: ${colors.metal};
`;

const IconButton = styled.div`
  background: transparent;
`;

const Wrapper = styled.button`
  cursor: pointer;

  // Button resets
  border: none;
  margin: 0;
  padding: 8px 16px;

  width: 100%;

  aspect-ratio: 1;

  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  background-color: ${colors.offWhite};
`;
