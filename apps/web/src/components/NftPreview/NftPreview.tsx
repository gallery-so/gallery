import { useCallback, useMemo } from 'react';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import styled from 'styled-components';

import transitions from '~/components/core/transitions';
import { NftFailureBoundary } from '~/components/NftFailureFallback/NftFailureBoundary';
import { NftFailureFallback } from '~/components/NftFailureFallback/NftFailureFallback';
import { NftPreviewFragment$key } from '~/generated/NftPreviewFragment.graphql';
import { useNftRetry } from '~/hooks/useNftRetry';
import { useIsMobileOrMobileLargeWindowWidth } from '~/hooks/useWindowSize';
import LinkToFullPageNftDetailModal from '~/scenes/NftDetailPage/LinkToFullPageNftDetailModal';
import NftDetailAnimation from '~/scenes/NftDetailPage/NftDetailAnimation';
import NftDetailGif from '~/scenes/NftDetailPage/NftDetailGif';
import NftDetailModel from '~/scenes/NftDetailPage/NftDetailModel';
import NftDetailVideo from '~/scenes/NftDetailPage/NftDetailVideo';
import { ReportingErrorBoundary } from '~/shared/errors/ReportingErrorBoundary';
import { useGetSinglePreviewImage } from '~/shared/relay/useGetPreviewImages';
import { isFirefox, isSafari } from '~/utils/browser';
import isSvg from '~/utils/isSvg';
import { getBackgroundColorOverrideForContract } from '~/utils/token';

import NftPreviewAsset, { RawNftPreviewAsset } from './NftPreviewAsset';
import NftPreviewLabel from './NftPreviewLabel';

type Props = {
  tokenRef: NftPreviewFragment$key;
  previewSize: number;
  ownerUsername?: string;
  hideLabelOnMobile?: boolean;
  disableLiverender?: boolean;
  columns?: number;
  isInFeedEvent?: boolean;
  shouldLiveRender?: boolean;
  collectionId?: string;
  onLoad?: () => void;
};

const contractsWhoseIFrameNFTsShouldNotTakeUpFullHeight = new Set([
  'KT1U6EHmNxJTkvaWJ4ThczG4FSDaHC21ssvi',
]);

function NftPreview({
  tokenRef,
  previewSize,
  disableLiverender = false,
  columns = 3,
  isInFeedEvent = false,
  shouldLiveRender,
  collectionId,
  onLoad,
}: Props) {
  const token = useFragment(
    graphql`
      fragment NftPreviewFragment on Token {
        dbid
        contract {
          contractAddress {
            address
          }
        }
        owner {
          username
        }
        media {
          ... on Media {
            __typename
            fallbackMedia {
              mediaURL
            }
          }

          ... on VideoMedia {
            __typename
            ...NftDetailVideoFragment
          }
          ... on GIFMedia {
            __typename
          }
          ... on HtmlMedia {
            __typename
          }
          ... on GltfMedia {
            __typename
            ...NftDetailModelFragment
          }
        }

        ...NftPreviewLabelFragment
        ...NftPreviewAssetFragment
        ...NftDetailAnimationFragment
        ...useGetPreviewImagesSingleFragment
        ...NftDetailGifFragment
      }
    `,
    tokenRef
  );

  const ownerUsername = token.owner?.username;

  const contractAddress = token.contract?.contractAddress?.address ?? '';

  const backgroundColorOverride = useMemo(
    () => getBackgroundColorOverrideForContract(contractAddress),
    [contractAddress]
  );

  const isIFrameLiveDisplay = Boolean(shouldLiveRender && token.media?.__typename === 'HtmlMedia');
  const isMobileOrLargeMobile = useIsMobileOrMobileLargeWindowWidth();

  const { handleNftLoaded } = useNftRetry({
    tokenId: token.dbid,
  });

  const onNftLoad = useCallback(() => {
    onLoad?.();
    handleNftLoaded();
  }, [handleNftLoaded, onLoad]);

  const PreviewAsset = useMemo(() => {
    if (disableLiverender) {
      return (
        <NftPreviewAsset
          onLoad={onNftLoad}
          tokenRef={token}
          // we'll request images at double the size of the element so that it looks sharp on retina
          size={previewSize * 2}
        />
      );
    }
    if (shouldLiveRender && token.media?.__typename === 'VideoMedia') {
      return <NftDetailVideo onLoad={onNftLoad} mediaRef={token.media} hideControls />;
    }
    if (shouldLiveRender && token.media?.__typename === 'GIFMedia') {
      return <NftDetailGif onLoad={onNftLoad} tokenRef={token} />;
    }
    if (shouldLiveRender && token.media?.__typename === 'GltfMedia') {
      return <NftDetailModel onLoad={onNftLoad} mediaRef={token.media} fullHeight={false} />;
    }
    if (isIFrameLiveDisplay) {
      return <NftDetailAnimation onLoad={onNftLoad} mediaRef={token} />;
    }

    return (
      <NftPreviewAsset
        onLoad={onNftLoad}
        tokenRef={token}
        // we'll request images at double the size of the element so that it looks sharp on retina
        size={previewSize * 2}
      />
    );
  }, [disableLiverender, shouldLiveRender, token, isIFrameLiveDisplay, previewSize, onNftLoad]);

  const imageUrl = useGetSinglePreviewImage({ tokenRef: token, size: 'large' });

  const isSvgOnWeirdBrowser = isSvg(imageUrl) && (isFirefox() || isSafari());
  // stretch the image to take up the full-width if...
  const fullWidth =
    // it's not in a feed event
    !isInFeedEvent &&
    // there are more than 1 columns in the layout
    (columns > 1 ||
      // the asset is an SVG on firefox
      isSvgOnWeirdBrowser ||
      // the asset is an iframe in single column mode
      (columns === 1 && isIFrameLiveDisplay));

  // iframes generally look better if they are free to occupy the full height of their container.
  // however, there are exceptions to this rule as some canvases produce weird behavior if the parent
  // container size is unexpected. since we're unable to parse the contents of an iframe easily,
  // we keep track of a list of contracts manually to exempt from this rule.
  //
  // in the long run, we should give the user the tools to size their NFTs manually (fit-to-X) on a per-
  // NFT or per-collection basis, similar to the Live Render setting
  const shouldBeExemptedFromFullHeightDisplay = useMemo(() => {
    const contractAddress = token.contract?.contractAddress?.address ?? '';
    return contractsWhoseIFrameNFTsShouldNotTakeUpFullHeight.has(contractAddress);
  }, [token.contract?.contractAddress]);

  const fullHeight = isIFrameLiveDisplay && !shouldBeExemptedFromFullHeightDisplay;

  return (
    <NftFailureBoundary
      tokenId={token.dbid}
      fallback={
        <NftFailureWrapper>
          <NftFailureFallback tokenId={token.dbid} />
        </NftFailureWrapper>
      }
    >
      <LinkToFullPageNftDetailModal
        username={ownerUsername ?? ''}
        collectionId={collectionId}
        tokenId={token.dbid}
      >
        <StyledNftPreview
          backgroundColorOverride={backgroundColorOverride}
          fullWidth={fullWidth}
          fullHeight={fullHeight}
          data-tokenid={token.dbid}
        >
          <ReportingErrorBoundary
            fallback={
              <RawNftPreviewAsset src={token.media?.fallbackMedia?.mediaURL} onLoad={onNftLoad} />
            }
          >
            {PreviewAsset}
          </ReportingErrorBoundary>

          {isMobileOrLargeMobile ? null : (
            <StyledNftFooter>
              <StyledNftLabel tokenRef={token} />
            </StyledNftFooter>
          )}
        </StyledNftPreview>
      </LinkToFullPageNftDetailModal>
    </NftFailureBoundary>
  );
}

const NftFailureWrapper = styled.div`
  width: 100%;
  max-width: 400px;
`;

const StyledNftLabel = styled(NftPreviewLabel)`
  transition: transform ${transitions.cubic};
  transform: translateY(5px);
`;

const StyledNftFooter = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;

  transition: opacity ${transitions.cubic};

  opacity: 0;
`;

const StyledNftPreview = styled.div<{
  backgroundColorOverride: string;
  fullWidth: boolean;
  fullHeight: boolean;
}>`
  cursor: pointer;

  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  overflow: hidden;
  max-height: 100%;
  width: ${({ fullWidth }) => (fullWidth ? '100%' : 'auto')};
  height: ${({ fullHeight }) => (fullHeight ? '100%' : 'initial')};

  ${({ backgroundColorOverride }) =>
    backgroundColorOverride && `background-color: ${backgroundColorOverride};`}

  &:hover ${StyledNftLabel} {
    transform: translateY(0px);
  }

  &:hover ${StyledNftFooter} {
    opacity: 1;
  }
`;

export default NftPreview;
