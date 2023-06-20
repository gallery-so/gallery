import { useCallback } from 'react';
import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import { ContentIsLoadedEvent } from '~/contexts/shimmer/ShimmerContext';
import { NftSelectorTokenFragment$key } from '~/generated/NftSelectorTokenFragment.graphql';
import { useNftRetry } from '~/hooks/useNftRetry';
import { ReportingErrorBoundary } from '~/shared/errors/ReportingErrorBoundary';

import { NftFailureBoundary } from '../NftFailureFallback/NftFailureBoundary';
import { NftFailureFallback } from '../NftFailureFallback/NftFailureFallback';
import { NftSelectorPreviewAsset, RawNftSelectorPreviewAsset } from './RawNftSelectorPreviewAsset';

type Props = {
  tokenRef: NftSelectorTokenFragment$key;
};
export function NftSelectorToken({ tokenRef }: Props) {
  const token = useFragment(
    graphql`
      fragment NftSelectorTokenFragment on Token {
        dbid
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
        ...RawNftSelectorPreviewAssetFragment
      }
    `,
    tokenRef
  );

  const { handleNftLoaded, handleNftError, retryKey, refreshMetadata, refreshingMetadata } =
    useNftRetry({ tokenId: token.dbid });

  const handleError = useCallback<ContentIsLoadedEvent>(
    (event) => {
      handleNftError(event);
    },
    [handleNftError]
  );

  const handleLoad = useCallback<ContentIsLoadedEvent>(
    (event) => {
      handleNftLoaded(event);
    },
    [handleNftLoaded]
  );

  return (
    <NftFailureBoundary
      key={retryKey}
      tokenId={token.dbid}
      fallback={
        <StyledNftFailureFallbackWrapper>
          <NftFailureFallback
            size="medium"
            tokenId={token.dbid}
            onRetry={refreshMetadata}
            refreshing={refreshingMetadata}
          />
        </StyledNftFailureFallbackWrapper>
      }
      onError={handleError}
    >
      <ReportingErrorBoundary
        fallback={
          <RawNftSelectorPreviewAsset
            type="image"
            isSelected={false}
            src={token.media?.fallbackMedia?.mediaURL}
            onLoad={handleLoad}
          />
        }
      >
        <NftSelectorPreviewAsset tokenRef={token} onLoad={handleLoad} />
      </ReportingErrorBoundary>
    </NftFailureBoundary>
  );
}

const StyledNftFailureFallbackWrapper = styled.div`
  height: 100%;
  width: 100%;
  position: relative;
`;
