import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import { PostComposerAssetFragment$key } from '~/generated/PostComposerAssetFragment.graphql';
import { useNftRetry } from '~/hooks/useNftRetry';
import { ReportingErrorBoundary } from '~/shared/errors/ReportingErrorBoundary';

import breakpoints from '../core/breakpoints';
import { NftFailureBoundary } from '../NftFailureFallback/NftFailureBoundary';
import { NftFailureFallback } from '../NftFailureFallback/NftFailureFallback';
import {
  NftSelectorPreviewAsset,
  RawNftSelectorPreviewAsset,
} from '../NftSelector/RawNftSelectorPreviewAsset';

type Props = {
  tokenRef: PostComposerAssetFragment$key;
};

export default function PostComposerAsset({ tokenRef }: Props) {
  const token = useFragment(
    graphql`
      fragment PostComposerAssetFragment on Token {
        __typename
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
  return (
    <StyledPostComposerAsset>
      <NftFailureBoundary
        key={retryKey}
        tokenId={token.dbid}
        fallback={
          <div>
            <NftFailureFallback
              size="medium"
              tokenId={token.dbid}
              onRetry={refreshMetadata}
              refreshing={refreshingMetadata}
            />
          </div>
        }
        onError={handleNftError}
      >
        <ReportingErrorBoundary
          fallback={
            <div>
              <RawNftSelectorPreviewAsset
                type="image"
                isSelected={false}
                src={token.media?.fallbackMedia?.mediaURL}
                onLoad={handleNftLoaded}
              />
            </div>
          }
        >
          <NftSelectorPreviewAsset tokenRef={token} onLoad={handleNftLoaded} />
        </ReportingErrorBoundary>
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
