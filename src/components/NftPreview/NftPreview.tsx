import transitions from 'components/core/transitions';
import { Fragment, useCallback, useMemo } from 'react';
import NftPreviewAsset from './NftPreviewAsset';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import Gradient from 'components/core/Gradient/Gradient';
import styled from 'styled-components';
import NftPreviewLabel from './NftPreviewLabel';
import { getBackgroundColorOverrideForContract } from 'utils/token';
import { useRouter } from 'next/router';
import { NftPreviewFragment$key } from '__generated__/NftPreviewFragment.graphql';
import NftDetailVideo from 'scenes/NftDetailPage/NftDetailVideo';
import NftDetailAnimation from 'scenes/NftDetailPage/NftDetailAnimation';
import getVideoOrImageUrlForNftPreview from 'utils/graphql/getVideoOrImageUrlForNftPreview';
import isFirefox from 'utils/isFirefox';
import isSvg from 'utils/isSvg';
import LinkToNftDetailView from 'scenes/NftDetailPage/LinkToNftDetailView';
import { useContentState } from 'contexts/shimmer/ShimmerContext';
import { useNftDisplayRetryLoader } from 'hooks/useNftDisplayRetryLoader';
import { NftFailureFallback } from 'components/NftFailureFallback/NftFailureFallback';
import { NftPreviewTokenFragment$key } from '../../../__generated__/NftPreviewTokenFragment.graphql';
import { NftFailureBoundary } from 'components/NftFailureFallback/NftFailureBoundary';

type Props = {
  tokenRef: NftPreviewFragment$key;
  previewSize: number;
  ownerUsername?: string;
  onClick?: () => void;
  hideLabelOnMobile?: boolean;
  disableLiverender?: boolean;
  columns?: number;
};

const nftPreviewTokenFragment = graphql`
  fragment NftPreviewTokenFragment on Token {
    id
    dbid
    name
    contract {
      name
      contractAddress {
        address
      }
    }
    media {
      ... on VideoMedia {
        __typename
        ...NftDetailVideoFragment
      }
      ... on HtmlMedia {
        __typename
      }
    }
    ...getVideoOrImageUrlForNftPreviewFragment
    ...NftPreviewAssetFragment
    ...NftDetailAnimationFragment
  }
`;

function NftPreview({
  tokenRef,
  previewSize,
  onClick,
  hideLabelOnMobile = false,
  disableLiverender = false,
  columns = 3,
}: Props) {
  const collectionToken = useFragment(
    graphql`
      fragment NftPreviewFragment on CollectionToken {
        token @required(action: THROW) {
          ...NftPreviewTokenFragment
        }
        tokenSettings {
          renderLive
        }
        collection @required(action: THROW) {
          id
          dbid
          gallery {
            owner {
              username
            }
          }
        }
        ...NftDetailViewFragment
      }
    `,
    tokenRef
  );

  const { collection, tokenSettings } = collectionToken;

  const username = collection.gallery?.owner?.username;
  const collectionId = collection.dbid;

  // This fragment is split up, so we can refresh it as a part
  // of the retry system
  const token = useFragment<NftPreviewTokenFragment$key>(
    nftPreviewTokenFragment,
    collectionToken.token
  );

  const contractAddress = token.contract?.contractAddress?.address ?? '';

  const backgroundColorOverride = useMemo(
    () => getBackgroundColorOverrideForContract(contractAddress),
    [contractAddress]
  );

  const {
    query: { collectionId: collectionIdInQuery },
  } = useRouter();

  // whether the user is on a gallery page or collection page prior to clicking on an NFT
  const originPage = collectionIdInQuery ? 'home' : 'gallery';
  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLElement>) => {
      if (onClick && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey) {
        event.preventDefault();
        onClick();
      }
    },
    [onClick]
  );

  const shouldLiverender = tokenSettings?.renderLive;
  const isIFrameLiveDisplay = Boolean(shouldLiverender && token.media?.__typename === 'HtmlMedia');

  const { handleNftLoaded, handleNftError, retryKey, refreshMetadata, refreshingMetadata } =
    useNftDisplayRetryLoader({
      tokenId: token.dbid,
    });

  const PreviewAsset = useMemo(() => {
    if (disableLiverender) {
      return (
        <NftPreviewAsset
          onLoad={handleNftLoaded}
          tokenRef={token}
          // we'll request images at double the size of the element so that it looks sharp on retina
          size={previewSize * 2}
        />
      );
    }
    if (shouldLiverender && token.media?.__typename === 'VideoMedia') {
      return <NftDetailVideo onLoad={handleNftLoaded} mediaRef={token.media} hideControls />;
    }
    if (isIFrameLiveDisplay) {
      return <NftDetailAnimation onLoad={handleNftLoaded} mediaRef={token} />;
    }
    return (
      <NftPreviewAsset
        onLoad={handleNftLoaded}
        tokenRef={token}
        // we'll request images at double the size of the element so that it looks sharp on retina
        size={previewSize * 2}
      />
    );
  }, [
    disableLiverender,
    shouldLiverender,
    token,
    isIFrameLiveDisplay,
    previewSize,
    handleNftLoaded,
  ]);

  const result = getVideoOrImageUrlForNftPreview(token);
  const isFirefoxSvg = isSvg(result?.urls?.large) && isFirefox();
  // stretch the image to take up the full-width if...
  const fullWidth =
    // there are more than 1 columns in the layout
    columns > 1 ||
    // the asset is an SVG on firefox
    isFirefoxSvg ||
    // the asset is an iframe in single column mode
    (columns === 1 && isIFrameLiveDisplay);

  const { aspectRatio } = useContentState();

  return (
    <NftFailureBoundary
      key={retryKey}
      fallback={
        <StyledNftPreview
          backgroundColorOverride={backgroundColorOverride}
          aspectRatio={aspectRatio}
          fullWidth={fullWidth}
        >
          <NftFailureFallback refreshing={refreshingMetadata} onRetry={refreshMetadata} />
        </StyledNftPreview>
      }
      onError={handleNftError}
    >
      <LinkToNftDetailView
        username={username ?? ''}
        collectionId={collectionId}
        tokenId={token.dbid}
        originPage={originPage}
      >
        {/* NextJS <Link> tags don't come with an anchor tag by default, so we're adding one here.
          This will inherit the `as` URL from the parent component. */}
        <StyledA onClick={handleClick}>
          <StyledNftPreview
            aspectRatio={aspectRatio}
            backgroundColorOverride={backgroundColorOverride}
            fullWidth={fullWidth}
          >
            {PreviewAsset}
            {hideLabelOnMobile ? null : (
              <StyledNftFooter>
                <StyledNftLabel
                  title={token.name}
                  collectionName={token.contract?.name}
                  contractAddress={contractAddress}
                />
                <StyledGradient type="bottom" direction="down" />
              </StyledNftFooter>
            )}
          </StyledNftPreview>
        </StyledA>
      </LinkToNftDetailView>
    </NftFailureBoundary>
  );
}

const StyledA = styled.a`
  display: flex;
  justify-content: center;
  align-items: center;
  width: inherit;
  height: inherit;
  text-decoration: none;
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

const StyledNftPreview = styled.div<{
  backgroundColorOverride: string;
  fullWidth: boolean;
  aspectRatio: number | null;
}>`
  cursor: pointer;

  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  overflow: hidden;
  max-height: 80vh;
  max-width: ${({ aspectRatio }) => `calc(80vh * ${aspectRatio})`};
  width: ${({ fullWidth }) => (fullWidth ? '100%' : 'auto')};
  height: inherit;
  
  // Only apply to safari. Somehow the height is not being set properly on safari.
  @media not all and (min-resolution:.001dpcm) {
     @supports (-webkit-appearance:none) {
        height: initial;
      }
  }

  ${({ backgroundColorOverride }) =>
    backgroundColorOverride && `background-color: ${backgroundColorOverride}`}};

  &:hover ${StyledNftLabel} {
    transform: translateY(0px);
  }

  &:hover ${StyledNftFooter} {
    opacity: 1;
  }
`;

export default NftPreview;
