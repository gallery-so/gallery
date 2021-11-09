import styled from 'styled-components';
import breakpoints from 'components/core/breakpoints';
import Gradient from 'components/core/Gradient/Gradient';
import transitions from 'components/core/transitions';
import { useCallback } from 'react';
import { navigate } from '@reach/router';
import ShimmerProvider from 'contexts/shimmer/ShimmerContext';
import { Nft } from 'types/Nft';
import { navigateToUrl } from 'utils/navigate';
import { LAYOUT_DIMENSIONS } from 'scenes/UserGalleryPage/UserGalleryCollection';
import NftPreviewLabel from './NftPreviewLabel';
import NftPreviewAsset from './NftPreviewAsset';

type Props = {
  nft: Nft;
  collectionId: string;
  gap: number;
  columns: number;
};

// const LAYOUT_DIMENSIONS: Record<number, any> = {
//   1: { size: 600, gap: 40 },
//   2: { size: 380, gap: 80 },
//   3: { size: 288, gap: 40 },
//   4: { size: 214, gap: 28 },
//   5: { size: 160, gap: 28 },
//   6: { size: 136, gap: 20 },
// };

function NftPreview({ nft, collectionId, columns }: Props) {
  const handleNftClick = useCallback((event: React.MouseEvent<HTMLElement>) => {
    navigateToUrl(`${window.location.pathname}/${collectionId}/${nft.id}`, event);
  }, [collectionId, nft.id]);

  return (
    <StyledNftPreview key={nft.id} size={LAYOUT_DIMENSIONS[columns].size} gap={LAYOUT_DIMENSIONS[columns].gap}>
      <StyledLinkWrapper onClick={handleNftClick}>
        <ShimmerProvider>
          <NftPreviewAsset nft={nft}/>
          <StyledNftFooter>
            <StyledNftLabel nft={nft} />
            <StyledGradient type="bottom" direction="down" />
          </StyledNftFooter>
        </ShimmerProvider>
      </StyledLinkWrapper>
    </StyledNftPreview>
  );
}

const StyledLinkWrapper = styled.a`
  cursor: pointer;
  display: flex;
  width: 100%;
`;

const StyledGradient = styled(Gradient)<{ type: 'top' | 'bottom' }>`
  position: absolute;
  ${({ type }) => type}: 0;
`;

const StyledNftLabel = styled(NftPreviewLabel)`
  transition: transform ${transitions.cubic};
  transform: translateY(5px);
`;

const StyledNftFooter = styled.div`
  position: absolute;
  bottom: 0;
  width: 100%;

  transition: opacity ${transitions.cubic};

  opacity: 0;
`;

const StyledNftPreview = styled.div<{ gap: number; size: number }>`
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  height: fit-content;
  overflow: hidden;

  &:hover ${StyledNftLabel} {
    transform: translateY(0px);
  }

  &:hover ${StyledNftFooter} {
    opacity: 1;
  }

  // use margin to create row-gap for now
  @media only screen and ${breakpoints.mobile} {
    width: 100%;
    margin-bottom: 40px;
  }

  // use margin to create row-gap for now
  @media only screen and ${breakpoints.mobileLarge} {
    width: calc((100% - ${({ gap }) => gap * 3}px) / 3);
    margin: ${({ gap }) => gap / 2}px;
  }

  // use margin to create row-gap for now
  @media only screen and ${breakpoints.desktop} {
    width: ${({ size }) => size}px;
    margin: ${({ gap }) => gap}px;
  }
`;

export default NftPreview;
