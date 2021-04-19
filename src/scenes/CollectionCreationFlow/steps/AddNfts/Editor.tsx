import { memo, useState } from 'react';
import styled from 'styled-components';

import { Subtitle, Text } from 'components/core/Text/Text';
import Spacer from 'components/core/Spacer/Spacer';
import colors from 'components/core/colors';

import { FOOTER_HEIGHT } from '../../WizardFooter';

function Directions() {
  return (
    <StyledDirections>
      <Subtitle>Add NFTs to your collection</Subtitle>
      <Spacer height={12} />
      <Text color={colors.gray}>
        On the left, select the NFTs you’d like to include in this collection.
        Once added, drag and drop to re-order.
      </Text>
    </StyledDirections>
  );
}

const StyledDirections = styled.div`
  text-align: center;

  width: 269px;
`;

function Editor() {
  const [stagedNfts, setStagedNfts] = useState([]);
  return (
    <StyledEditor>{stagedNfts.length ? 'todo' : <Directions />}</StyledEditor>
  );
}

const StyledEditor = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;

  width: 100%;
  height: calc(100vh - ${FOOTER_HEIGHT});
`;

export default memo(Editor);
