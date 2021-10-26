import styled from 'styled-components';
import breakpoints from 'components/core/breakpoints';
import Gradient from 'components/core/Gradient/Gradient';
import transitions from 'components/core/transitions';
import ShimmerProvider from 'contexts/shimmer/ShimmerContext';
import { Nft } from 'types/Nft';
import NftPreviewLabel from './NftPreviewLabel';
import NftPreviewAsset from './NftPreviewAsset';

type Props = {
  nft: Nft;
  collectionId: string;
  gap: number;
};

function NftPreview({ nft, collectionId, gap }: Props) {
  // utilizing the a tag will create a more authentic, consistent experience when it comes to links
  // can also use Link from reach router for continuity

  return (
    <StyledNftPreview key={nft.id} gap={gap}>
        <StyledLinkWrapper href={`${window.location.pathname}/${collectionId}/${nft.id}`}>
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

const StyledNftPreview = styled.div<{ gap: number }>`
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
    width: 288px;
    margin: ${({ gap }) => gap}px;
  }
`;

export default NftPreview;
