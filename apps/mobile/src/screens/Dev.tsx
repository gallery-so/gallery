import { useCallback, useMemo, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { graphql, useLazyLoadQuery } from 'react-relay';
import { DEBUG_PASSWORD_KEY, DEBUG_USERNAME_KEY } from 'src/constants/storageKeys';
import { useDebugAuthLogin } from 'src/hooks/useDebugAuthLogin';
import usePersistedState from 'src/hooks/usePersistedState';
import { getServerEnvironment } from 'src/utils/getServerEnvironment';

import { Button } from '~/components/Button';
import { FadedInput } from '~/components/FadedInput';
import { Typography } from '~/components/Typography';
import { DevQuery } from '~/generated/DevQuery.graphql';

const isLocalServer = getServerEnvironment() === 'local';

export function Dev() {
  const query = useLazyLoadQuery<DevQuery>(
    graphql`
      query DevQuery {
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

  //useKeyDown('Escape', handleCloseDebugger);
  // useMultiKeyDown(['Control', 'd'], handleToggleDebugger);

  const debugLogin = useDebugAuthLogin();

  const handleLogin = useCallback(async () => {
    try {
      await debugLogin({
        asUsername: username,
        debugToolsPassword: isLocalServer ? undefined : password,
      });
      setErrorMessage('');
    } catch (e: unknown) {
      if (e instanceof Error) {
        setErrorMessage(e.message);
      }
    }
  }, [debugLogin, username, password]);

  const handleUsernameChange = useCallback(
    (event: any) => {
      setUsername(event.target.value);
      setErrorMessage('');
    },
    [setUsername]
  );

  const handlePasswordChange = useCallback(
    (event: any) => {
      setPassword(event.target.value);
      setErrorMessage('');
    },
    [setPassword]
  );

  return (
    <ScrollView className="flex-1 bg-white dark:bg-black-900">
      <Typography className="text-lg" font={{ family: 'ABCDiatype', weight: 'Bold' }}>
        ☢️ DEBUG MODE
      </Typography>

      <View className="flex flex-row space-x-2">
        <Typography font={{ family: 'ABCDiatype', weight: 'Regular' }}>Login As</Typography>

        {isLocalServer ? null : (
          <>
            <FadedInput
              onChange={handleUsernameChange}
              placeholder="Username"
              defaultValue={username}
            />

            <FadedInput
              onChange={handlePasswordChange}
              placeholder="Admin Password"
              defaultValue={password}
            />
          </>
        )}

        <Button
          text="Submit"
          onPress={handleLogin}
          disabled={!username.length}
          eventName="Debugger Login"
          eventElementId="Submit login"
        />

        {errorMessage && (
          <Typography
            className="text-error text-sm"
            font={{ family: 'ABCDiatype', weight: 'Regular' }}
          >
            {errorMessage}
          </Typography>
        )}

        <Typography font={{ family: 'ABCDiatype', weight: 'Regular' }}>Detected User</Typography>

        <Typography font={{ family: 'ABCDiatype', weight: 'Regular' }}>
          {loggedInUserInfo}
        </Typography>
      </View>
    </ScrollView>
  );
}
