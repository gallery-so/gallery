import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import { PostComposerAssetFragment$key } from '~/generated/PostComposerAssetFragment.graphql';
import { useNftRetry } from '~/hooks/useNftRetry';

import breakpoints from '../core/breakpoints';
import { NftFailureBoundary } from '../NftFailureFallback/NftFailureBoundary';
import { NftFailureFallback } from '../NftFailureFallback/NftFailureFallback';
import { NftSelectorPreviewAsset } from '../NftSelector/RawNftSelectorPreviewAsset';

type Props = {
  tokenRef: PostComposerAssetFragment$key;
};

export default function PostComposerAsset({ tokenRef }: Props) {
  const token = useFragment(
    graphql`
      fragment PostComposerAssetFragment on Token {
        __typename
        dbid
        ...RawNftSelectorPreviewAssetFragment
      }
    `,
    tokenRef
  );

  const { handleNftLoaded, handleNftError, retryKey, refreshMetadata, refreshingMetadata } =
    useNftRetry({ tokenId: token.dbid });

  return (
    <StyledPostComposerAsset>
      <NftFailureBoundary
        key={retryKey}
        tokenId={token.dbid}
        fallback={
          // TODO: update FailureFallback or FailureBoundary to handle "Loading..."
          <NftFailureFallback
            size="medium"
            tokenId={token.dbid}
            onRetry={refreshMetadata}
            refreshing={refreshingMetadata}
          />
        }
        onError={handleNftError}
      >
        <NftSelectorPreviewAsset tokenRef={token} onLoad={handleNftLoaded} />
      </NftFailureBoundary>
    </StyledPostComposerAsset>
  );
}

const StyledPostComposerAsset = styled.div`
  width: 100%;
  height: 100%;
  min-width: 100%;
  min-height: 100%;

  @media only screen and ${breakpoints.tablet} {
    width: 180px;
    height: 180px;
    min-width: 180px;
    min-height: 180px;
  }
`;
