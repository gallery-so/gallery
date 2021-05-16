import { useCallback } from 'react';
import { navigate } from '@reach/router';
import styled from 'styled-components';
import { BodyRegular, Display } from 'components/core/Text/Text';
import Button from 'components/core/Button/Button';
import colors from 'components/core/colors';
import Spacer from 'components/core/Spacer/Spacer';
import FullPageCenteredStep from 'flows/shared/components/FullPageCenteredStep/FullPageCenteredStep';

function Congratulations() {
  const handleClick = useCallback(() => {
    // TODO__v1: when backend is ready, get username from useUser
    navigate('/link-to-my-gallery');
  }, []);

  return (
    <FullPageCenteredStep>
      <Display>Congratulations</Display>
      <Spacer height={8} />
      <StyledBodyText color={colors.gray50}>
        Let's show your collection to the world.
      </StyledBodyText>
      <Spacer height={24} />
      <StyledButton text="Take me to my gallery" onClick={handleClick} />
    </FullPageCenteredStep>
  );
}

const StyledBodyText = styled(BodyRegular)`
  max-width: 400px;
  text-align: center;
`;

const StyledButton = styled(Button)`
  padding: 0px 24px;
`;

export default Congratulations;
