import { useCallback } from 'react';
import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import { NftSelectorTokenFragment$key } from '~/generated/NftSelectorTokenFragment.graphql';
import { useNftRetry } from '~/hooks/useNftRetry';
import { useTrack } from '~/shared/contexts/AnalyticsContext';

import { NftFailureBoundary } from '../NftFailureFallback/NftFailureBoundary';
import { NftFailureFallback } from '../NftFailureFallback/NftFailureFallback';
import { NftSelectorPreviewAsset } from './RawNftSelectorPreviewAsset';

type Props = {
  tokenRef: NftSelectorTokenFragment$key;
  onSelectToken: (tokenId: string) => void;
  isInGroup?: boolean;
};
export function NftSelectorToken({ tokenRef, onSelectToken, isInGroup = false }: Props) {
  const token = useFragment(
    graphql`
      fragment NftSelectorTokenFragment on Token {
        dbid
        ...RawNftSelectorPreviewAssetFragment
      }
    `,
    tokenRef
  );

  const track = useTrack();

  const { handleNftLoaded, handleNftError, retryKey, refreshMetadata, refreshingMetadata } =
    useNftRetry({ tokenId: token.dbid });

  const handleClick = useCallback(() => {
    if (isInGroup) {
      return;
    }
    track('NFT Selector: Selected NFT');
    onSelectToken(token.dbid);
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
      onError={handleNftError}
    >
      <NftSelectorPreviewAsset tokenRef={token} onLoad={handleNftLoaded} />
      <StyledOutline onClick={handleClick} />
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
