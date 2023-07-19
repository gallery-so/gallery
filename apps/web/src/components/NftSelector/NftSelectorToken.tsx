import { useCallback } from 'react';
import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import { ContentIsLoadedEvent } from '~/contexts/shimmer/ShimmerContext';
import {
  NftSelectorTokenFragment$data,
  NftSelectorTokenFragment$key,
} from '~/generated/NftSelectorTokenFragment.graphql';
import { useNftRetry } from '~/hooks/useNftRetry';
import { useTrack } from '~/shared/contexts/AnalyticsContext';
import { ReportingErrorBoundary } from '~/shared/errors/ReportingErrorBoundary';

import { NftFailureBoundary } from '../NftFailureFallback/NftFailureBoundary';
import { NftFailureFallback } from '../NftFailureFallback/NftFailureFallback';
import { NftSelectorPreviewAsset, RawNftSelectorPreviewAsset } from './RawNftSelectorPreviewAsset';

type Props = {
  tokenRef: NftSelectorTokenFragment$key;
  onSelectToken: (token: NftSelectorTokenFragment$data) => void;
  isInGroup?: boolean;
};
export function NftSelectorToken({ tokenRef, onSelectToken, isInGroup = false }: Props) {
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
        # eslint-disable-next-line relay/must-colocate-fragment-spreads
        ...PostComposerFragment
      }
    `,
    tokenRef
  );

  const track = useTrack();

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

  const handleClick = useCallback(() => {
    if (isInGroup) {
      return;
    }
    track('NFT Selector: Selected NFT');
    onSelectToken(token);
  }, [isInGroup, track, onSelectToken, token]);

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
          <div>
            <RawNftSelectorPreviewAsset
              type="image"
              isSelected={false}
              src={token.media?.fallbackMedia?.mediaURL}
              onLoad={handleLoad}
            />
            <StyledOutline onClick={handleClick} />
          </div>
        }
      >
        <NftSelectorPreviewAsset tokenRef={token} onLoad={handleLoad} />
        <StyledOutline onClick={handleClick} />
      </ReportingErrorBoundary>
    </NftFailureBoundary>
  );
}

const StyledNftFailureFallbackWrapper = styled.div`
  height: 100%;
  width: 100%;
  position: relative;
`;

const StyledOutline = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;

  user-select: none;
  z-index: 2;
`;
