import { useCallback, useMemo, useState } from 'react';
import { View } from 'react-native';
import { graphql, useLazyLoadQuery } from 'react-relay';
import { DEBUG_PASSWORD_KEY, DEBUG_USERNAME_KEY } from 'src/constants/storageKeys';
import { useDebugAuthLogin } from '~/shared/hooks/useDebugAuthLogin';
import usePersistedState from 'src/hooks/usePersistedState';
import { getServerEnvironment } from '~/shared/utils/getServerEnvironment';

import { Button } from '~/components/Button';
import { FadedInput } from '~/components/FadedInput';
import { Typography } from '~/components/Typography';
import { DebuggerQuery } from '~/generated/DebuggerQuery.graphql';

const isLocalServer = getServerEnvironment() === 'local';

export function Debugger() {
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
    (newUsername: string) => {
      setUsername(newUsername);
      setErrorMessage('');
    },
    [setUsername]
  );

  const handlePasswordChange = useCallback(
    (newPassword: string) => {
      setPassword(newPassword);
      setErrorMessage('');
    },
    [setPassword]
  );

  return (
    <View
      className="flex-1 flex flex-col bg-white dark:bg-black-900 space-y-4 p-10"
      style={{ paddingTop: 150 }}
    >
      <Typography className="text-lg" font={{ family: 'ABCDiatype', weight: 'Bold' }}>
        ☢️ DEBUG MODE
      </Typography>
      <Typography font={{ family: 'ABCDiatype', weight: 'Regular' }}>Login As</Typography>

      {isLocalServer ? null : (
        <View className="flex gap-3">
          <FadedInput
            className="py-2"
            onChangeText={handleUsernameChange}
            placeholder="Username"
            value={username}
          />

          <FadedInput
            className="py-2"
            onChangeText={handlePasswordChange}
            placeholder="Admin Password"
            value={password}
          />
        </View>
      )}

      <Button
        text="Submit"
        onPress={handleLogin}
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

      <Typography font={{ family: 'ABCDiatype', weight: 'Regular' }}>{loggedInUserInfo}</Typography>
    </View>
  );
}
