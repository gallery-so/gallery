import { LAYOUT_GAP_BREAKPOINTS } from 'constants/layout';
import styled from 'styled-components';
import breakpoints, { size } from 'components/core/breakpoints';
import Gradient from 'components/core/Gradient/Gradient';
import transitions from 'components/core/transitions';
import { useCallback, useMemo } from 'react';
import ShimmerProvider from 'contexts/shimmer/ShimmerContext';
import { Nft } from 'types/Nft';
import { useNavigateToUrl } from 'utils/navigate';
import { useBreakpoint } from 'hooks/useWindowSize';
import NftPreviewLabel from './NftPreviewLabel';
import NftPreviewAsset from './NftPreviewAsset';

type Props = {
  nft: Nft;
  collectionId: string;
  columns: number;
};

const SINGLE_COLUMN_NFT_WIDTH = 600;
const MOBILE_NFT_WIDTH = 288;

const LAYOUT_DIMENSIONS: Record<number, number> = {
  1: SINGLE_COLUMN_NFT_WIDTH,
  2: 482,
  3: 308,
  4: 221,
  5: 169,
  6: 134,
};

function NftPreview({ nft, collectionId, columns }: Props) {
  const navigateToUrl = useNavigateToUrl();

  const handleNftClick = useCallback(
    (event: React.MouseEvent<HTMLElement>) => {
      navigateToUrl(`${window.location.pathname}/${collectionId}/${nft.id}`, event);
    },
    [collectionId, navigate, nft.id]
  );
  const screenWidth = useBreakpoint();

  // width for rendering so that we request the apprpriate size image.
  const previewSize = useMemo(
    () => (screenWidth === size.mobile ? MOBILE_NFT_WIDTH : LAYOUT_DIMENSIONS[columns]),
    [columns, screenWidth]
  );

  return (
    <StyledNftPreview key={nft.id} columns={columns}>
      <StyledLinkWrapper onClick={handleNftClick}>
        <ShimmerProvider>
          {/* // we'll request images at double the size of the element so that it looks sharp on retina */}
          <NftPreviewAsset nft={nft} size={previewSize * 2} />
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

const StyledNftPreview = styled.div<{ columns: number }>`
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
  width: 100%;
  margin-bottom: 40px;

  // width looks nasty but it allows us to conditionally apply different width rules based on # columns:
  // - if single columm, use hardcoded width because the NFT isnt as wide as the whole page
  // - if more columns, use calc to automatically set width based on column #
  // this is important because while we *could* use hardcoded widths for desktop, we need to use dynamic widths for tablet
  @media only screen and ${breakpoints.mobileLarge} {
    width: ${({ columns }) =>
      columns === 1
        ? `${SINGLE_COLUMN_NFT_WIDTH}px;`
        : `calc((100% - ${LAYOUT_GAP_BREAKPOINTS.mobileLarge * columns}px) / ${columns});`}
    margin: ${LAYOUT_GAP_BREAKPOINTS.mobileLarge / 2}px;
  }

  @media only screen and ${breakpoints.desktop} {
    width: ${({ columns }) =>
      columns === 1
        ? `${SINGLE_COLUMN_NFT_WIDTH}px;`
        : `calc((100% - ${LAYOUT_GAP_BREAKPOINTS.desktop * columns}px) / ${columns});`}
    margin: ${LAYOUT_GAP_BREAKPOINTS.desktop / 2}px;
  }
`;

export default NftPreview;
