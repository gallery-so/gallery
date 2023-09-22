import { useCallback } from 'react';
import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import { NftSelectorTokenFragment$key } from '~/generated/NftSelectorTokenFragment.graphql';
import { useTrack } from '~/shared/contexts/AnalyticsContext';

import { NftFailureBoundary } from '../NftFailureFallback/NftFailureBoundary';
import { NftSelectorPreviewAsset } from './NftSelectorPreviewAsset';

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
        ...NftSelectorPreviewAssetFragment
      }
    `,
    tokenRef
  );

  const track = useTrack();

  const handleClick = useCallback(() => {
    if (isInGroup) {
      return;
    }
    track('NFT Selector: Selected NFT');
    onSelectToken(token.dbid);
  }, [isInGroup, track, onSelectToken, token]);

  return (
    <>
      <StyledOutline onClick={handleClick} />
      <NftFailureBoundary tokenId={token.dbid} fallbackSize={isInGroup ? 'tiny' : 'medium'}>
        <NftSelectorPreviewAsset tokenRef={token} />
      </NftFailureBoundary>
    </>
  );
}

const StyledOutline = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;

  user-select: none;
  z-index: 2;
`;
