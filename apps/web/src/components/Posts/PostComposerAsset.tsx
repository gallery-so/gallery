import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import { PostComposerAssetFragment$key } from '~/generated/PostComposerAssetFragment.graphql';

import breakpoints from '../core/breakpoints';
import { NftFailureBoundary } from '../NftFailureFallback/NftFailureBoundary';
import { NftSelectorPreviewAsset } from '../NftSelector/NftSelectorPreviewAsset';

type Props = {
  tokenRef: PostComposerAssetFragment$key;
};

export default function PostComposerAsset({ tokenRef }: Props) {
  const token = useFragment(
    graphql`
      fragment PostComposerAssetFragment on Token {
        __typename
        dbid
        ...NftSelectorPreviewAssetFragment
      }
    `,
    tokenRef
  );

  return (
    <StyledPostComposerAsset>
      <NftFailureBoundary tokenId={token.dbid}>
        <NftSelectorPreviewAsset tokenRef={token} resizeToSquare={false} />
      </NftFailureBoundary>
    </StyledPostComposerAsset>
  );
}

const StyledPostComposerAsset = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  min-width: 100%;
  min-height: 100%;
`;
