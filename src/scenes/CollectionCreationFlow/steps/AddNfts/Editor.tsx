import { memo, useState } from 'react';
import styled from 'styled-components';
import { Nft } from 'types/Nft';

import { FOOTER_HEIGHT } from 'scenes/CollectionCreationFlow/WizardFooter';

type Props = {
  stagedNfts: Nft[];
};

function Editor({ stagedNfts }: Props) {
  return <StyledEditor>{stagedNfts.map(() => 'staged')}</StyledEditor>;
}

const StyledEditor = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;

  width: 100%;
  height: calc(100vh - ${FOOTER_HEIGHT}px);
`;

export default memo(Editor);
