import { useRouter } from 'next/router';
import { useCallback, useMemo, useState } from 'react';
import { graphql, useLazyLoadQuery } from 'react-relay';
import styled from 'styled-components';

import { Button } from '~/components/core/Button/Button';
import Input from '~/components/core/Input/Input';
import { VStack } from '~/components/core/Spacer/Stack';
import ErrorText from '~/components/core/Text/ErrorText';
import { TitleS } from '~/components/core/Text/Text';
import { DEBUG_PASSWORD_KEY, DEBUG_USERNAME_KEY } from '~/constants/storageKeys';
import { GLOBAL_SIDEBAR_DESKTOP_WIDTH } from '~/contexts/globalLayout/GlobalSidebar/GlobalSidebar';
import { DebuggerQuery } from '~/generated/DebuggerQuery.graphql';
import useKeyDown from '~/hooks/useKeyDown';
import useMultiKeyDown from '~/hooks/useMultiKeyDown';
import usePersistedState from '~/hooks/usePersistedState';
import { useDebugAuthLogin } from '~/shared/hooks/useDebugAuthLogin';
import { getServerEnvironment } from '~/utils/getServerEnvironment';

const isLocalServer = getServerEnvironment() === 'local';

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
  const [password, setPassword] = usePersistedState(DEBUG_PASSWORD_KEY, '');
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

  const debugLogin = useDebugAuthLogin();

  const { reload: triggerPageRefresh } = useRouter();

  const handleLogin = useCallback(async () => {
    try {
      await debugLogin({
        asUsername: username,
        debugToolsPassword: isLocalServer ? undefined : password,
      });
      setErrorMessage('');
      // needed to apply new auth cookie to app
      triggerPageRefresh();
    } catch (e: unknown) {
      if (e instanceof Error) {
        setErrorMessage(e.message);
      }
    }
  }, [debugLogin, triggerPageRefresh, username, password]);

  const handleUsernameChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setUsername(event.target.value);
      setErrorMessage('');
    },
    [setUsername]
  );

  const handlePasswordChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setPassword(event.target.value);
      setErrorMessage('');
    },
    [setPassword]
  );

  return isDebuggerVisible ? (
    <StyledDebugger>
      <VStack gap={16}>
        <VStack gap={24}>
          <TitleS>☢️ DEBUG MODE</TitleS>
          <LoginContainer gap={4}>
            <TitleS>Login As</TitleS>
            <VStack gap={8}>
              <Input
                onChange={handleUsernameChange}
                placeholder="Username"
                defaultValue={username}
              />
              {isLocalServer ? null : (
                <Input
                  onChange={handlePasswordChange}
                  placeholder="Admin Password"
                  defaultValue={password}
                  type="password"
                />
              )}

              <StyledButton
                eventElementId={null}
                eventName={null}
                onClick={handleLogin}
                disabled={!username.length}
              >
                Submit
              </StyledButton>
            </VStack>
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
  top: 76px;
  left: ${GLOBAL_SIDEBAR_DESKTOP_WIDTH + 20}px;
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
  align-self: flex-end;
`;

const LoggedInUserContainer = styled.div``;

const StyledPre = styled.pre`
  white-space: pre-wrap;
`;

export default Debugger;
