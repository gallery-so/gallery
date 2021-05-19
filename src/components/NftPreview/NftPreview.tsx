import styled from 'styled-components';
import { Nft } from 'types/Nft';
import breakpoints from 'components/core/breakpoints';
import NftPreviewLabel from './NftPreviewLabel';
import Gradient from 'components/core/Gradient/Gradient';
import transitions from 'components/core/transitions';
import { useCallback } from 'react';
import { navigate } from '@reach/router';

const IMG_FALLBACK_URL = 'https://i.ibb.co/q7DP0Dz/no-image.png';

function resize(imgUrl: string, width: number) {
  if (!imgUrl) return null;
  return imgUrl.replace('=s250', `=s${width}`);
}

type Props = {
  nft: Nft;
  collectionId: string;
};

function NftPreview({ nft, collectionId }: Props) {
  const imgUrl =
    resize(nft.imagePreviewUrl, 275) || nft.imageUrl || IMG_FALLBACK_URL;

  const handleNftClick = useCallback(() => {
    navigate(`${window.location.pathname}/${collectionId}/${nft.id}`);
  }, [collectionId, nft.id]);

  return (
    <StyledNftPreview key={nft.id}>
      <StyledLinkWrapper onClick={handleNftClick}>
        <StyledNft src={imgUrl} alt={nft.name} />
        <StyledNftFooter>
          <StyledNftLabel nft={nft} />
          <StyledGradient type="bottom" direction="down" />
        </StyledNftFooter>
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

const NFT_PREVIEW_WIDTH = {
  mobile: '100%',
  // For screen sizes in between mobile and desktop, set dynamic width to
  // enable 3 nfts per row by accounting for 2 40px column gaps
  mobileLarge: 'calc((100% - 80px) / 3)',
  desktop: '288px',
};

const StyledNftPreview = styled.div`
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

  width: ${NFT_PREVIEW_WIDTH.mobile};

  @media only screen and ${breakpoints.mobileLarge} {
    width: ${NFT_PREVIEW_WIDTH.mobileLarge};
  }
  @media only screen and ${breakpoints.desktop} {
    width: ${NFT_PREVIEW_WIDTH.desktop};
  }
`;

// TODO: set max-height on NFT?
const StyledNft = styled.img`
  width: 100%;
  height: 100%;
`;

export default NftPreview;
