import colors from 'components/core/colors';
import { BaseM, BaseS } from 'components/core/Text/Text';
import { useEffect } from 'react';
import styled from 'styled-components';

type Props = {
  isSidebar?: boolean;
  onLoad?: () => void;
};

export default function FailedNftPreview({ isSidebar, onLoad }: Props) {
  useEffect(() => {
    if (onLoad) {
      onLoad();
    }
  }, [onLoad]);

  return (
    <StyledFailedNft size={isSidebar ? 64 : 300}>
      {isSidebar ? (
        <StyledFailedNftTextSidebar>Could not load</StyledFailedNftTextSidebar>
      ) : (
        <StyledFailedNftText>Could not load</StyledFailedNftText>
      )}
    </StyledFailedNft>
  );
}

const StyledFailedNft = styled.div<{ size: number }>`
  height: ${({ size }) => size}px;
  width: ${({ size }) => size}px;
  max-width: 100%;
  max-height: 100%;
  background-color: ${colors.offWhite};
  display: flex;
  justify-content: center;
  align-items: center;
`;

const StyledFailedNftTextSidebar = styled(BaseS)`
  color: ${colors.metal};
  text-align: center;
`;

const StyledFailedNftText = styled(BaseM)`
  color: ${colors.metal};
  text-align: center;
`;
