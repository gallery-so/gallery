import { memo } from 'react';
import styled from 'styled-components';

import { FOOTER_HEIGHT } from 'scenes/CollectionCreationFlow/WizardFooter';
import { Subtitle } from 'components/core/Text/Text';

import { DragEndEvent } from '@dnd-kit/core';
import { Nft } from 'types/Nft';

import NftSortableContext from '../NftSortableContext';
import SortableNft from './SortableNft';

type Props = {
  stagedNfts: Nft[];
  onSortNfts: (event: DragEndEvent) => void;
};

function Editor({ stagedNfts, onSortNfts }: Props) {
  return (
    <StyledEditor>
      <Subtitle size="large">Your collection</Subtitle>
      <NftSortableContext nfts={stagedNfts} handleDragEnd={onSortNfts}>
        <NftsContainer>
          {stagedNfts.map((nft) => (
            <SortableNft key={nft.id} nft={nft} />
          ))}
        </NftsContainer>
      </NftSortableContext>
    </StyledEditor>
  );
}

const StyledEditor = styled.div`
  display: flex;
  flex-direction: column;

  width: 100%;
  height: calc(100vh - ${FOOTER_HEIGHT}px);

  padding: 100px 80px;

  overflow: scroll;
`;

const NftsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  column-gap: 48px;
  row-gap: 48px;

  margin-top: 20px;
`;

export default memo(Editor);
