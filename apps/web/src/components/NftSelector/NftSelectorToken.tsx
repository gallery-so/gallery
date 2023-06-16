import { useCallback } from 'react';
import { graphql, useFragment } from 'react-relay';

import { ContentIsLoadedEvent } from '~/contexts/shimmer/ShimmerContext';
import { NftSelectorTokenFragment$key } from '~/generated/NftSelectorTokenFragment.graphql';
import { useNftRetry } from '~/hooks/useNftRetry';
import { CouldNotRenderNftError } from '~/shared/errors/CouldNotRenderNftError';
import { ReportingErrorBoundary } from '~/shared/errors/ReportingErrorBoundary';
import getVideoOrImageUrlForNftPreview from '~/shared/relay/getVideoOrImageUrlForNftPreview';
import { getBackgroundColorOverrideForContract } from '~/utils/token';

import { StyledSidebarNftIcon } from '../GalleryEditor/PiecesSidebar/SidebarNftIcon';
import { NftFailureBoundary } from '../NftFailureFallback/NftFailureBoundary';
import { NftFailureFallback } from '../NftFailureFallback/NftFailureFallback';
import { RawNftSelectorPreviewAsset } from './RawNftSelectorPreviewAsset';

type Props = {
  tokenRef: NftSelectorTokenFragment$key;
};
export function NftSelectorToken({ tokenRef }: Props) {
  const token = useFragment(
    graphql`
      fragment NftSelectorTokenFragment on Token {
        dbid
        contract {
          contractAddress {
            address
          }
        }
        media {
          ... on Media {
            fallbackMedia {
              mediaURL
            }
          }

          ... on SyncingMedia {
            __typename
          }
        }
        ...getVideoOrImageUrlForNftPreviewFragment
      }
    `,
    tokenRef
  );

  const {
    isFailed,
    handleNftLoaded,
    handleNftError,
    retryKey,
    refreshMetadata,
    refreshingMetadata,
  } = useNftRetry({ tokenId: token.dbid });

  const contractAddress = token.contract?.contractAddress?.address ?? '';
  const backgroundColorOverride = getBackgroundColorOverrideForContract(contractAddress);

  const previewUrlSet = getVideoOrImageUrlForNftPreview({
    tokenRef: token,
    handleReportError: reportError,
  });

  const handleError = useCallback<ContentIsLoadedEvent>(
    (event) => {
      handleNftError(event);
      // handleTokenRenderError(token.dbid);
    },
    [handleNftError]
  );

  const handleLoad = useCallback<ContentIsLoadedEvent>(
    (event) => {
      handleNftLoaded(event);
      // handleTokenRenderSuccess(token.dbid);
    },
    [handleNftLoaded]
  );

  const handleClick = useCallback(() => {
    if (isFailed) {
      refreshMetadata();

      return;
    }
  }, [isFailed, refreshMetadata]);

  // TODO: handle this error
  if (!previewUrlSet?.urls.small) {
    return null;
    throw new CouldNotRenderNftError('SidebarNftIcon', 'could not find small image url');
  }

  return (
    <NftFailureBoundary
      key={retryKey}
      tokenId={token.dbid}
      fallback={
        // <div>Fail</div>
        <StyledSidebarNftIcon backgroundColorOverride={backgroundColorOverride}>
          <NftFailureFallback
            size="medium"
            tokenId={token.dbid}
            onRetry={refreshMetadata}
            refreshing={refreshingMetadata}
          />
        </StyledSidebarNftIcon>
      }
      onError={handleError}
    >
      <ReportingErrorBoundary
        fallback={
          // <div>Fail 2</div>

          <RawNftSelectorPreviewAsset
            type="image"
            isSelected={false}
            src={token.media?.fallbackMedia?.mediaURL}
            onLoad={handleLoad}
          />
        }
      >
        <RawNftSelectorPreviewAsset
          type={previewUrlSet.type}
          isSelected={false}
          src={previewUrlSet.urls.small}
          onLoad={handleLoad}
        />
      </ReportingErrorBoundary>
    </NftFailureBoundary>
  );
}
