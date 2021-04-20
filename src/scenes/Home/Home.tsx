import { RouteComponentProps } from '@reach/router';
import { memo } from 'react';
import styled from 'styled-components';
import Password from 'components/Password/Password';
import { Text } from 'components/core/Text/Text';
import colors from 'components/core/colors';

function Home(_: RouteComponentProps) {
  // on dev, this will route to localhost:4000/api/test
  // on prod, this will route to api.gallery.so/api/test
  // const { data, error } = useSwr('/test');
  // console.log('the result', data, error);

  return (
    <StyledHome>
      <StyledHeader>GALLERY</StyledHeader>
      <Text>Show your collection to the world</Text>
      <Password />
    </StyledHome>
  );
}

// if we wanna do global styling
const StyledHome = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 15vh;
`;

const StyledHeader = styled.p`
  text-align: center;
  color: black;
  font-size: 50px;
  margin-bottom: 10px;
`;

const StyledLinkText = styled(Text)`
  color: ${colors.gray};
  transition: color 0.2s;
`;

const StyledWaitlistLink = styled.a`
  margin-top: 30px;
  color: ${colors.gray};
  &:hover ${StyledLinkText} {
    // color: ${colors.black};
  }
`;

export default memo(Home);
