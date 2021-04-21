import { navigate, RouteComponentProps } from '@reach/router';
import styled from 'styled-components';
import ActionText from 'components/core/ActionText/ActionText';
import { useCallback } from 'react';

function Welcome(_: RouteComponentProps) {
  const handleClick = useCallback(() => {
    navigate('/create');
  }, []);

  return (
    <StyledWelcome>
      <StyledActionText>YOU ARE PICASSO</StyledActionText>
      <button onClick={handleClick}></button>
    </StyledWelcome>
  );
}
const StyledActionText = styled(ActionText)`
  font-size: 100px;
`;
const StyledWelcome = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 140px;
`;

export default Welcome;
