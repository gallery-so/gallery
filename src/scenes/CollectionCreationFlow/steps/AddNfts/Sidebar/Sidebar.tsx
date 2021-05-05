import { memo } from 'react';
import styled from 'styled-components';

import { Text } from 'components/core/Text/Text';
import colors from 'components/core/colors';
import Spacer from 'components/core/Spacer/Spacer';
import { FOOTER_HEIGHT } from 'scenes/CollectionCreationFlow/WizardFooter';
import SidebarNftIcon from './SidebarNftIcon';
import { ReactComponent as SearchIcon } from './search.svg';

import { EditModeNft, Nft } from 'types/Nft';

import { useAllNftsState } from 'contexts/collectionEditor/CollectionEditorContext';

function Sidebar() {
  const allNfts = useAllNftsState();
  return (
    <StyledSidebar>
      <Header>
        <Text weight="bold">Your NFTs</Text>
        <Text color={colors.gray50}>0xj2T2...a81H</Text>
      </Header>
      <Spacer height={12} />
      <Selection>
        {allNfts.map((nft: EditModeNft, index: number) => (
          <SidebarNftIcon key={nft.nft.id} nft={nft} index={index} />
        ))}
      </Selection>
      <Spacer height={12} />
    </StyledSidebar>
  );
}

const StyledSidebar = styled.div`
  width: 100%;
  height: calc(100vh - ${FOOTER_HEIGHT}px);

  background: #f7f7f7;

  padding: 50px 32px;

  overflow: scroll;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
`;

const Searchbar = styled.div`
  display: flex;
  align-items: center;

  border: 1px solid ${colors.gray50};

  padding: 8px 12px;
`;

const Selection = styled.div`
  display: flex;
  flex-wrap: wrap;
  column-gap: 12px;
  row-gap: 12px;
`;

export default memo(Sidebar);
