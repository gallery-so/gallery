import { useCallback } from 'react';
import styled from 'styled-components';
import { Text } from 'components/core/Text/Text';
import Button from 'components/core/Button/Button';
import colors from 'components/core/colors';
import Spacer from 'components/core/Spacer/Spacer';

function Congratulations() {
  const handleClick = useCallback(() => {
    alert(
      `navigate to profile page. we'll need to know the user ID (or username) by this point`
    );
  }, []);

  return (
    <StyledCongratulations>
      <StyledHeader>Congratulations</StyledHeader>
      <StyledBodyText>Let's show your collection to the world.</StyledBodyText>
      <Spacer height={20} />
      <StyledButton text="Take me to my gallery" onClick={handleClick} />
    </StyledCongratulations>
  );
}

const StyledHeader = styled.p`
  text-align: center;
  color: black;
  font-size: 50px;
  white-space: nowrap;
  margin-bottom: 24px;
`;

const StyledBodyText = styled(Text)`
  margin-bottom: 24px;
  color: ${colors.gray50};
`;

const StyledCongratulations = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 140px;
  width: min-content;
  margin: 20vh auto 0;
`;

const StyledButton = styled(Button)`
  padding: 0px 24px;
`;

export default Congratulations;
