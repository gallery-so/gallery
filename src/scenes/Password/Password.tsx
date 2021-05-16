import { useCallback, useState, useRef, useEffect } from 'react';
import { navigate, Redirect, RouteComponentProps } from '@reach/router';
import styled from 'styled-components';

import Button from 'components/core/Button/Button';
import colors from 'components/core/colors';
import { Display, BodyRegular } from 'components/core/Text/Text';
import Spacer from 'components/core/Spacer/Spacer';

import useIsAuthenticated from 'contexts/auth/useIsAuthenticated';
import usePersistedState from 'hooks/usePersistedState';
import { validatePassword } from 'utils/password';

function Password(_: RouteComponentProps) {
  const [storedPassword, storePassword] = usePersistedState('password', null);
  const enteredPassword = useRef('');

  // put storedPassword in a ref so that if the user guesses it correctly,
  // it prevents an insta-redirect (they should see the cool button reveal instead)
  const storedPasswordSnapshot = useRef(storedPassword ?? '');
  const isPasswordValid =
    storedPassword && validatePassword(storedPasswordSnapshot.current);

  const isAuthenticated = useIsAuthenticated();

  const [isFormVisibleAndUnlocked, setIsFormVisibleAndUnlocked] = useState(
    false
  );

  const handlePasswordChange = useCallback((event) => {
    event.preventDefault();
    const value = event.target.value;
    enteredPassword.current = value;
    setIsFormVisibleAndUnlocked(validatePassword(value));
  }, []);

  const handleEnterGallery = useCallback(() => {
    // if the user is already authenticated, /auth will handle forwarding
    // them directly to their profile
    storePassword(enteredPassword.current);
    navigate('/auth');
  }, [storePassword]);

  const onEnterPress = useCallback(
    (e) => {
      if (e.key === 'Enter') {
        handleEnterGallery();
      }
    },
    [handleEnterGallery]
  );

  useEffect(() => {
    if (!isFormVisibleAndUnlocked) return;

    document.addEventListener('keypress', onEnterPress);

    return () => document.removeEventListener('keypress', onEnterPress);
  }, [onEnterPress, isFormVisibleAndUnlocked]);

  if (isPasswordValid && !isAuthenticated) {
    return <Redirect to="/auth" />;
  }

  if (isPasswordValid && isAuthenticated) {
    return <Redirect to="/" />;
  }

  return (
    <StyledPassword>
      <Display caps>Gallery</Display>
      <Spacer height={8} />
      <BodyRegular>Show your collection to the world</BodyRegular>
      <Spacer height={24} />
      <StyledPasswordInput
        disabled={isFormVisibleAndUnlocked}
        name="password"
        placeholder="Enter password"
        onChange={handlePasswordChange}
      />
      <Spacer height={8} />
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

const INPUT_WIDTH = 203;

const StyledPasswordInput = styled.input`
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

const StyledButton = styled(Button)`
  width: ${INPUT_WIDTH}px;
`;

const AnimatedStyledButton = styled(StyledButton)<{ visible: boolean }>`
  opacity: ${({ visible }) => (visible ? 1 : 0)};
  pointer-events: ${({ visible }) => (visible ? 'inherit' : 'none')};
  transform: translateY(${({ visible }) => (visible ? 0 : -48)}px);
  transition: transform 700ms cubic-bezier(0, 0, 0, 1.07);
`;

export default Password;
