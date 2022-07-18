import colors from 'components/core/colors';
import { BaseM, BaseS } from 'components/core/Text/Text';
import styled from 'styled-components';

type Props = {
  isSidebar?: boolean;
  size?: number;
};

export default function FailedNftPreview({ isSidebar, size = 64 }: Props) {
  return (
    <StyledFailedNft size={size}>
      <StyledFailedNftText isSidebar={isSidebar}>Could not load</StyledFailedNftText>
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

const StyledFailedNftText = styled(BaseS)<{ isSidebar?: boolean }>`
  color: ${colors.metal};
  text-align: center;
`;
