import breakpoints from 'components/core/breakpoints';
import colors from 'components/core/colors';
import { BaseM, BaseS } from 'components/core/Text/Text';
import { useEffect } from 'react';
import styled from 'styled-components';

type Props = {
  isSidebar?: boolean;
  size?: number;
  onLoad?: () => void;
};

export default function FailedNftPreview({ isSidebar, onLoad, size }: Props) {
  useEffect(() => {
    if (onLoad) {
      onLoad();
    }
  }, [onLoad]);

  return (
    <StyledFailedNft size={size}>
      {isSidebar ? (
        <StyledFailedNftTextSidebar>Could not load</StyledFailedNftTextSidebar>
      ) : (
        <StyledFailedNftText>Could not load</StyledFailedNftText>
      )}
    </StyledFailedNft>
  );
}

const StyledFailedNft = styled.div<{ size?: number }>`
  height: 100px;
  width: 100px;
  background-color: ${colors.offWhite};
  display: flex;
  justify-content: center;
  align-items: center;

  @media only screen and ${breakpoints.desktop} {
    height: ${({ size }) => (size ? `${size}px` : '100px')};
    width: ${({ size }) => (size ? `${size}px` : '100%')};
  }
`;

const StyledFailedNftTextSidebar = styled(BaseS)`
  color: ${colors.metal};
  text-align: center;
`;

const StyledFailedNftText = styled(BaseM)`
  color: ${colors.metal};
  text-align: center;
`;
