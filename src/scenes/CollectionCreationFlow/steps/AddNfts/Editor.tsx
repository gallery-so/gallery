import { memo, useState } from 'react';
import styled from 'styled-components';
import { Nft } from 'types/Nft';

import { FOOTER_HEIGHT } from 'scenes/CollectionCreationFlow/WizardFooter';
import { Subtitle } from 'components/core/Text/Text';

type Props = {
  stagedNfts: Nft[];
};

function Editor({ stagedNfts }: Props) {
  return (
    <StyledEditor>
      <Subtitle size="large">Your collection</Subtitle>
      <NftsContainer>
        {stagedNfts.map((nft) => (
          <img key={nft.id} src={nft.image_url} alt={nft.id} />
        ))}
      </NftsContainer>
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
