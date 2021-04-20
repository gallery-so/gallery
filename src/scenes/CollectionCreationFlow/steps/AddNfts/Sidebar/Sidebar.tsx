import { memo, useState } from 'react';
import styled from 'styled-components';

import { Text } from 'components/core/Text/Text';
import colors from 'components/core/colors';
import Spacer from 'components/core/Spacer/Spacer';
import { FOOTER_HEIGHT } from 'scenes/CollectionCreationFlow/WizardFooter';

import NftPreviewIcon from './NftPreviewIcon';

import dummy1 from '../dummy_1.png';
import dummy2 from '../dummy_2.png';
import dummy3 from '../dummy_3.png';
import { ReactComponent as SearchIcon } from './search.svg';

function randomPic() {
  const pics = [dummy1, dummy2, dummy3];
  const index = Math.floor(Math.random() * pics.length);
  return pics[index];
}

function randomPics(n: number) {
  const pics = [];
  for (let i = 0; i < n; i++) {
    pics.push({
      id: `${i}`,
      name: 'test',
      image_url: randomPic(),
      image_preview_url: 'test',
    });
  }
  return pics;
}

function Sidebar() {
  const [allNfts] = useState(randomPics(50));

  return (
    <StyledSidebar>
      <Header>
        <Text weight="bold">Your NFTs</Text>
        <Text color={colors.gray}>0xj2T2...a81H</Text>
      </Header>
      <Spacer height={12} />
      <Searchbar>
        <SearchIcon />
        <Spacer width={6} />
        <Text color={colors.gray}>Search</Text>
      </Searchbar>
      <Spacer height={16} />
      <Selection>
        {allNfts.map((nft) => (
          <NftPreviewIcon key={nft.id} nft={nft} />
        ))}
      </Selection>
      <Spacer height={12} />
    </StyledSidebar>
  );
}

const SIDEBAR_TOP_PADDING = 50;

const StyledSidebar = styled.div`
  width: 270px;
  height: calc(100vh - ${FOOTER_HEIGHT}px - ${SIDEBAR_TOP_PADDING}px);

  background: #f7f7f7;

  padding: ${SIDEBAR_TOP_PADDING}px 32px;

  overflow: scroll;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
`;

const Searchbar = styled.div`
  display: flex;
  align-items: center;

  border: 1px solid ${colors.gray};

  padding: 8px 12px;
`;

const Selection = styled.div`
  display: flex;
  flex-wrap: wrap;

  column-gap: 12px;
  row-gap: 12px;
`;

export default memo(Sidebar);
