import { useCallback, useState, useRef, useEffect } from 'react';
import { navigate, Redirect, RouteComponentProps } from '@reach/router';
import styled from 'styled-components';

import Button from 'components/core/Button/Button';
import colors from 'components/core/colors';
import Spacer from 'components/core/Spacer/Spacer';
import Page from 'components/core/Page/Page';

import useIsAuthenticated from 'contexts/auth/useIsAuthenticated';
import usePersistedState from 'hooks/usePersistedState';
import { validatePassword } from 'utils/password';
import { PASSWORD_LOCAL_STORAGE_KEY } from 'contexts/auth/constants';
import GalleryIntro from 'components/GalleryTitleIntro/GalleryTitleIntro';

function Password(_: RouteComponentProps) {
  const [storedPassword, storePassword] = usePersistedState<string | null>(
    PASSWORD_LOCAL_STORAGE_KEY,
    null,
  );
  const enteredPassword = useRef('');

  // Put storedPassword in a ref so that if the user guesses it correctly,
  // it prevents an insta-redirect (they should see the cool button reveal instead)
  const storedPasswordSnapshot = useRef(storedPassword ?? '');
  const isPasswordValid = storedPassword && validatePassword(storedPasswordSnapshot.current);

  const isAuthenticated = useIsAuthenticated();

  const [isFormVisibleAndUnlocked, setIsFormVisibleAndUnlocked] = useState(
    false,
  );

  const handlePasswordChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    event.preventDefault();
    const value = event.target.value;
    enteredPassword.current = value;
    setIsFormVisibleAndUnlocked(validatePassword(value));
  }, []);

  const handleEnterGallery = useCallback(() => {
    // If the user is already authenticated, /auth will handle forwarding
    // them directly to their profile
    storePassword(enteredPassword.current);
    void navigate('/auth');
  }, [storePassword]);

  const onEnterPress = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Enter') {
        handleEnterGallery();
      }
    },
    [handleEnterGallery],
  );

  useEffect(() => {
    if (!isFormVisibleAndUnlocked) {
      return;
    }

    document.addEventListener('keypress', onEnterPress);

    return () => {
      document.removeEventListener('keypress', onEnterPress);
    };
  }, [onEnterPress, isFormVisibleAndUnlocked]);

  if (isPasswordValid && !isAuthenticated) {
    return <Redirect to="/auth" noThrow />;
  }

  if (isPasswordValid && isAuthenticated) {
    return <Redirect to="/" noThrow />;
  }

  return (
    <Page centered>
      <GalleryIntro />
      <StyledPasswordInput
        disabled={isFormVisibleAndUnlocked}
        name="password"
        placeholder="Enter password"
        onChange={handlePasswordChange}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck="false"
      />
      <Spacer height={8} />
      <AnimatedStyledButton
        visible={isFormVisibleAndUnlocked}
        text="Enter"
        onClick={handleEnterGallery}
      />
    </Page>
  );
}

const INPUT_WIDTH = 203;

const StyledPasswordInput = styled.input`
  padding: 0.5rem 2.5rem 0.5rem 1rem;
  width: ${INPUT_WIDTH}px;
  height: 40px;
  border: 1px solid ${colors.gray10};
  border-radius: 0px;

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
