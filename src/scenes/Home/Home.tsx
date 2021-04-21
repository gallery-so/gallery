import { RouteComponentProps } from '@reach/router';
import { memo, useCallback, useState } from 'react';
import styled from 'styled-components';
import Password from 'components/Password/Password';
import { Text } from 'components/core/Text/Text';
import colors from 'components/core/colors';
import WalletSelector from 'components/WalletSelector/WalletSelector';

function Home(_: RouteComponentProps) {
  // on dev, this will route to localhost:4000/api/test
  // on prod, this will route to api.gallery.so/api/test
  // const { data, error } = useSwr('/test');
  // console.log('the result', data, error);

  const [showWalletSelector, setShowWalletSelector] = useState(false);
  const handleNextClick = useCallback(() => {
    setShowWalletSelector(true);
  }, []);

  if (showWalletSelector) {
    return (
      <StyledHome>
        <WalletSelector />
      </StyledHome>
    );
  }

  return (
    <StyledHome>
      <StyledHeader>GALLERY</StyledHeader>
      <Text>Show your collection to the world</Text>
      <Password handleNextClick={handleNextClick} />
    </StyledHome>
  );
}

// if we wanna do global styling
const StyledHome = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 20vh;
`;

const StyledHeader = styled.p`
  text-align: center;
  color: black;
  font-size: 50px;
  margin-bottom: 10px;
`;

export default memo(Home);
