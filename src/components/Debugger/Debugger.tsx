import { Button } from 'components/core/Button/Button';
import Input from 'components/core/Input/Input';
import { HStack, VStack } from 'components/core/Spacer/Stack';
import ErrorText from 'components/core/Text/ErrorText';
import { TitleS } from 'components/core/Text/Text';
import { DEBUG_USERNAME_KEY } from 'constants/storageKeys';
import { useAuthActions } from 'contexts/auth/AuthContext';
import useKeyDown from 'hooks/useKeyDown';
import useMultiKeyDown from 'hooks/useMultiKeyDown';
import usePersistedState from 'hooks/usePersistedState';
import { useState, useCallback, useMemo } from 'react';
import { graphql, useLazyLoadQuery } from 'react-relay';
import styled from 'styled-components';
import { DebuggerQuery } from '__generated__/DebuggerQuery.graphql';
import { useDebugAuthLogin } from './useDebugAuth';

const Debugger = () => {
  const query = useLazyLoadQuery<DebuggerQuery>(
    graphql`
      query DebuggerQuery {
        viewer {
          ... on Viewer {
            user {
              dbid
              username
              wallets {
                dbid
                chainAddress {
                  chain
                  address
                }
              }
            }
          }
        }
      }
    `,
    {}
  );

  const loggedInUserInfo = useMemo(
    () =>
      JSON.stringify(
        {
          dbid: query.viewer?.user?.dbid ?? '',
          username: query.viewer?.user?.username ?? '',
          wallets: query.viewer?.user?.wallets ?? [],
        },
        undefined,
        2
      ),
    [query]
  );

  const [username, setUsername] = usePersistedState(DEBUG_USERNAME_KEY, '');
  const [errorMessage, setErrorMessage] = useState('');
  const [isDebuggerVisible, setIsDebuggerVisible] = useState(false);

  const handleCloseDebugger = useCallback(() => {
    setIsDebuggerVisible(false);
  }, []);

  const handleToggleDebugger = useCallback(() => {
    setIsDebuggerVisible((prev) => !prev);
  }, []);

  useKeyDown('Escape', handleCloseDebugger);
  useMultiKeyDown(['Control', 'd'], handleToggleDebugger);

  const login = useDebugAuthLogin();
  const { handleLogin: handleRegisterLogin } = useAuthActions();

  const handleLogin = useCallback(async () => {
    try {
      const userId = await login({ asUsername: username });
      await handleRegisterLogin(userId, '');
      setErrorMessage('');
    } catch (e: unknown) {
      if (e instanceof Error) {
        setErrorMessage(e.message);
      }
    }
  }, [handleRegisterLogin, login, username]);

  const handleUsernameChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setUsername(event.target.value);
      setErrorMessage('');
    },
    [setUsername]
  );

  return isDebuggerVisible ? (
    <StyledDebugger>
      <VStack gap={16}>
        <VStack gap={24}>
          <TitleS>☢️ DEBUG MODE</TitleS>
          <LoginContainer gap={4}>
            <TitleS>Login As</TitleS>
            <HStack gap={8}>
              <Input
                onChange={handleUsernameChange}
                placeholder="Username"
                defaultValue={username}
              />
              <StyledButton onClick={handleLogin} disabled={!username.length}>
                Submit
              </StyledButton>
            </HStack>
            <ErrorText message={errorMessage} />
          </LoginContainer>
        </VStack>
        <LoggedInUserContainer>
          <TitleS>Detected User</TitleS>
          <StyledPre>{loggedInUserInfo}</StyledPre>
        </LoggedInUserContainer>
      </VStack>
    </StyledDebugger>
  ) : null;
};

const StyledDebugger = styled.div`
  position: fixed;
  top: 20px;
  left: 20px;
  padding: 24px;
  width: 420px;

  z-index: 2;
  border: 1px solid black;
  background: white;
`;

const LoginContainer = styled(VStack)`
  display: flex;
  flex-direction: column;

  input {
    width: 100%;
  }
`;

const StyledButton = styled(Button)`
  align-self: right;
`;

const LoggedInUserContainer = styled.div``;

const StyledPre = styled.pre`
  white-space: pre-wrap;
`;

export default Debugger;
