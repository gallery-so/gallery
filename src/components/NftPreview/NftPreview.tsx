import styled from 'styled-components';
import Gradient from 'components/core/Gradient/Gradient';
import transitions from 'components/core/transitions';
import { useCallback } from 'react';
import ShimmerProvider from 'contexts/shimmer/ShimmerContext';
import { Nft } from 'types/Nft';
import { useNavigateToUrl } from 'utils/navigate';
import { useIsMobileWindowWidth } from 'hooks/useWindowSize';
import NftPreviewLabel from './NftPreviewLabel';
import NftPreviewAsset from './NftPreviewAsset';

type Props = {
  nft: Nft;
  collectionId: string;
  columns: number;
  __APRIL__FOOLS__isAprilFoolsEdition__?: boolean;
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

function NftPreview({
  nft,
  collectionId,
  columns,
  __APRIL__FOOLS__isAprilFoolsEdition__ = false,
}: Props) {
  const navigateToUrl = useNavigateToUrl();

  const username = window.location.pathname.split('/')[1];
  const storage = globalThis?.sessionStorage;

  const handleNftClick = useCallback(
    (event: React.MouseEvent<HTMLElement>) => {
      event.stopPropagation();
      // TODO: Should refactor to utilize navigation context instead of session storage
      if (storage) storage.setItem('prevPage', window.location.pathname);
      navigateToUrl(`/${username}/${collectionId}/${nft.id}`, event);
    },
    [collectionId, navigateToUrl, nft.id, storage, username]
  );
  const isMobile = useIsMobileWindowWidth();

  // width for rendering so that we request the apprpriate size image.
  const previewSize = isMobile ? MOBILE_NFT_WIDTH : LAYOUT_DIMENSIONS[columns];

  return (
    <StyledNftPreview
      key={nft.id}
      columns={columns}
      __APRIL__FOOLS__isAprilFoolsEdition__={__APRIL__FOOLS__isAprilFoolsEdition__}
    >
      <StyledLinkWrapper onClick={handleNftClick}>
        <ShimmerProvider>
          {/* // we'll request images at double the size of the element so that it looks sharp on retina */}
          <NftPreviewAsset nft={nft} size={previewSize * 2} />
          <StyledNftFooter
            __APRIL__FOOLS__isAprilFoolsEdition__={__APRIL__FOOLS__isAprilFoolsEdition__}
          >
            {__APRIL__FOOLS__isAprilFoolsEdition__ ? null : <StyledNftLabel nft={nft} />}
            <StyledGradient
              type="bottom"
              direction="down"
              __APRIL__FOOLS__isAprilFoolsEdition__={__APRIL__FOOLS__isAprilFoolsEdition__}
            />
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

const StyledGradient = styled(Gradient)<{
  type: 'top' | 'bottom';
  __APRIL__FOOLS__isAprilFoolsEdition__?: boolean;
}>`
  position: absolute;
  ${({ type }) => type}: 0;

  ${({ __APRIL__FOOLS__isAprilFoolsEdition__ }) =>
    __APRIL__FOOLS__isAprilFoolsEdition__ &&
    `
    height: 100%;
    background-image: linear-gradient(to bottom, rgb(0 0 0 / 10%) 0%, rgb(0 0 0 / 10%) 100%);
  `}
`;

const StyledNftLabel = styled(NftPreviewLabel)`
  transition: transform ${transitions.cubic};
  transform: translateY(5px);
`;

const StyledNftFooter = styled.div<{ __APRIL__FOOLS__isAprilFoolsEdition__?: boolean }>`
  position: absolute;
  bottom: 0;
  width: 100%;

  ${({ __APRIL__FOOLS__isAprilFoolsEdition__ }) =>
    __APRIL__FOOLS__isAprilFoolsEdition__ && 'height: 100%;'}

  transition: opacity ${transitions.cubic};

  opacity: 0;
`;

const StyledNftPreview = styled.div<{
  columns: number;
  __APRIL__FOOLS__isAprilFoolsEdition__?: boolean;
}>`
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  height: ${({ __APRIL__FOOLS__isAprilFoolsEdition__ }) =>
    __APRIL__FOOLS__isAprilFoolsEdition__ ? 'inherit' : 'object-fit'};
  overflow: hidden;

  &:hover ${StyledNftLabel} {
    transform: translateY(0px);
  }

  &:hover ${StyledNftFooter} {
    opacity: 1;
  }
`;

export default NftPreview;
