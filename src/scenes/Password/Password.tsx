import { useCallback, useState, useRef } from 'react';
import { navigate, Redirect, RouteComponentProps } from '@reach/router';
import styled from 'styled-components';

import Button from 'components/core/Button/Button';
import colors from 'components/core/colors';
import { Text } from 'components/core/Text/Text';
import Spacer from 'components/core/Spacer/Spacer';

import useIsAuthenticated from 'contexts/auth/useIsAuthenticated';
import usePersistedState from 'hooks/usePersistedState';
import { validatePassword } from 'utils/password';

function Password(_: RouteComponentProps) {
  const [storedPassword, storePassword] = usePersistedState('password', null);

  // put storedPassword in a ref so that if the user guesses it correctly,
  // it prevents an insta-redirect (they should see the cool button reveal instead)
  const storedPasswordSnapshot = useRef(storedPassword ?? '');
  const isPasswordValid =
    storedPassword && validatePassword(storedPasswordSnapshot.current);

  const isAuthenticated = useIsAuthenticated();

  const [isFormVisibleAndUnlocked, setIsFormVisibleAndUnlocked] = useState(
    false
  );

  const handleSubmit = useCallback(
    (event) => {
      event.preventDefault();
      const userValue = event.target.elements.password.value;
      const isPasswordValid = validatePassword(userValue);

      if (isPasswordValid) {
        storePassword(userValue);
        setIsFormVisibleAndUnlocked(true);
      }
    },
    [storePassword]
  );

  const handleEnterGallery = useCallback(() => {
    // if the user is already authenticated, /auth will handle forwarding
    // them directly to their profile
    navigate('/auth');
  }, []);

  if (isPasswordValid && !isAuthenticated) {
    return <Redirect to="/auth" />;
  }

  if (isPasswordValid && isAuthenticated) {
    return <Redirect to="/" />;
  }

  return (
    <StyledPassword>
      <StyledHeader>GALLERY</StyledHeader>
      <Text>Show your collection to the world</Text>
      <Spacer height={48} />
      <StyledForm onSubmit={handleSubmit}>
        <StyledPasswordInput
          disabled={isFormVisibleAndUnlocked}
          name="password"
          placeholder="Enter password"
        />
      </StyledForm>
      <AnimatedStyledButton
        visible={isFormVisibleAndUnlocked}
        text="Enter"
        onClick={handleEnterGallery}
      />
    </StyledPassword>
  );
}

const StyledPassword = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
`;

const StyledHeader = styled.p`
  text-align: center;
  color: black;
  font-size: 50px;
  margin: 0;
`;

const StyledForm = styled.form`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const INPUT_WIDTH = 203;

const StyledPasswordInput = styled.input`
  margin: 20px 0 10px;
  padding: 0.5rem 2.5rem 0.5rem 1rem;
  width: ${INPUT_WIDTH}px;
  height: 40px;
  border: 1px solid ${colors.gray10};

  line-height: 1.25rem;
  outline-color: ${colors.black} !important;
  -webkit-text-security: disc;

  transition: outline 0.5s, background-color 0.5s;
  z-index: 10;

  &active: {
    border-width: 2px;
  }
  :disabled {
    background-color: ${colors.gray10};
  }
`;

// TODO: save this as a general transition under /core
const transitionStyle = `700ms cubic-bezier(0, 0, 0, 1.07)`;

const StyledButton = styled(Button)`
  width: ${INPUT_WIDTH}px;
`;

const AnimatedStyledButton = styled(StyledButton)<{ visible: boolean }>`
  opacity: ${({ visible }) => (visible ? 1 : 0)};
  pointer-events: ${({ visible }) => (visible ? 'inherit' : 'none')};
  transform: translateY(${({ visible }) => (visible ? 0 : -50)}px);
  transition: transform ${transitionStyle};
`;

export default Password;
