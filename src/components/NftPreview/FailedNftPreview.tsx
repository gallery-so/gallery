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
      {isSidebar ? <StyledBaseS>Could not load</StyledBaseS> : <BaseM>Could not load</BaseM>}
    </StyledFailedNft>
  );
}

const StyledBaseS = styled(BaseS)`
  font-size: 11px;
`;

const StyledFailedNft = styled.div<{ size?: number }>`
  height: ${({ size }) => (size ? `${size}px` : 'auto')};
  background-color: ${colors.offWhite};
  padding-bottom: 100%;
  width: 100%;
  aspect-ratio: 1;

  ${BaseM}, ${StyledBaseS} {
    color: ${colors.metal};
    text-align: center;
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }
`;
