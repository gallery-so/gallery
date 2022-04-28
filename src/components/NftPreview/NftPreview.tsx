import transitions from 'components/core/transitions';
import { useCallback, useMemo } from 'react';
import ShimmerProvider, { useContentState } from 'contexts/shimmer/ShimmerContext';
import { useNavigateToUrl } from 'utils/navigate';
import { useIsMobileWindowWidth } from 'hooks/useWindowSize';
import NftPreviewAsset from './NftPreviewAsset';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import { NftPreviewFragment$key } from '__generated__/NftPreviewFragment.graphql';
import { useCollectionColumns } from 'hooks/useCollectionColumns';
import Gradient from 'components/core/Gradient/Gradient';
import styled from 'styled-components';
import NftPreviewLabel from './NftPreviewLabel';
import { getBackgroundColorOverrideForContract } from 'utils/nft';

type Props = {
  galleryNftRef: NftPreviewFragment$key;
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

// simple wrapper component so the child can pull state from ShimmerProvider
function NftPreviewWithShimmer(props: Props) {
  return (
    <ShimmerProvider>
      <NftPreview {...props} />
    </ShimmerProvider>
  );
}

function NftPreview({ galleryNftRef }: Props) {
  const { nft, collection } = useFragment(
    graphql`
      fragment NftPreviewFragment on CollectionNft {
        nft @required(action: THROW) {
          dbid
          name
          openseaCollectionName
          contractAddress
          ...NftPreviewAssetFragment
        }
        collection @required(action: THROW) {
          id
          dbid
          ...useCollectionColumnsFragment
        }
      }
    `,
    galleryNftRef
  );

  const columns = useCollectionColumns(collection);

  const navigateToUrl = useNavigateToUrl();

  const username = window.location.pathname.split('/')[1];
  const storage = globalThis?.sessionStorage;

  const handleNftClick = useCallback(
    (event: React.MouseEvent<HTMLElement>) => {
      event.stopPropagation();
      // TODO: Should refactor to utilize navigation context instead of session storage
      if (storage) storage.setItem('prevPage', window.location.pathname);
      navigateToUrl(`/${username}/${collection.dbid}/${nft.dbid}`, event);
    },
    [collection.dbid, navigateToUrl, nft.dbid, storage, username]
  );
  const isMobile = useIsMobileWindowWidth();

  // width for rendering so that we request the apprpriate size image.
  const previewSize = isMobile ? MOBILE_NFT_WIDTH : LAYOUT_DIMENSIONS[columns];

  const { aspectRatioType } = useContentState();

  const nftPreviewWidth = useMemo(() => {
    if (columns > 1) return '100%';

    // this could be a 1-liner but wanted to make it explicit
    if (columns === 1) {
      if (isMobile) {
        return '100%';
      }
      if (aspectRatioType === 'wide') {
        return '100%';
      }
      if (aspectRatioType === 'square' || aspectRatioType === 'tall') {
        return '60%';
      }
    }
  }, [columns, aspectRatioType, isMobile]);

  const backgroundColorOverride = useMemo(
    () => getBackgroundColorOverrideForContract(nft.contractAddress ?? ''),
    [nft.contractAddress]
  );

  return (
    <StyledNftPreview width={nftPreviewWidth} backgroundColorOverride={backgroundColorOverride}>
      <StyledLinkWrapper onClick={handleNftClick}>
        {/* // we'll request images at double the size of the element so that it looks sharp on retina */}
        <NftPreviewAsset nftRef={nft} size={previewSize * 2} />
        <StyledNftFooter>
          <StyledNftLabel title={nft.name} collectionName={nft.openseaCollectionName} />
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
  max-height: inherit;
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

const StyledNftPreview = styled.div<{ width?: string; backgroundColorOverride: string }>`
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  height: fit-content;
  overflow: hidden;

  ${({ backgroundColorOverride }) =>
    backgroundColorOverride && `background-color: ${backgroundColorOverride}`}};

  max-height: 80vh;
  max-width: ${({ width }) => width};

  &:hover ${StyledNftLabel} {
    transform: translateY(0px);
  }

  &:hover ${StyledNftFooter} {
    opacity: 1;
  }
`;

export default NftPreviewWithShimmer;
