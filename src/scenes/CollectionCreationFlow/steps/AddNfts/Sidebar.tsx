import { memo } from 'react';
import styled from 'styled-components';

import { Text } from 'components/core/Text/Text';
import colors from 'components/core/colors';
import Spacer from 'components/core/Spacer/Spacer';

import { ReactComponent as SearchIcon } from './search.svg';

function Sidebar() {
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
      <Spacer height={12} />
    </StyledSidebar>
  );
}

const StyledSidebar = styled.div`
  width: 280px;
  height: 100vh;

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

  border: 1px solid ${colors.gray};

  padding: 8px 12px;
`;

export default memo(Sidebar);
