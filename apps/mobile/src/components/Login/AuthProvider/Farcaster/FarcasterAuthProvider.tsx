/* eslint-disable no-console */
import {
  AuthClientError,
  AuthKitProvider,
  StatusAPIResponse,
  useSignIn,
} from '@farcaster/auth-kit';
import { useNavigation } from '@react-navigation/native';
import { ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import { Linking } from 'react-native';
import { useTrack } from 'shared/contexts/AnalyticsContext';
import { useReportError } from 'shared/contexts/ErrorReportingContext';
import { NeynarPayloadVariables } from 'shared/hooks/useAuthPayloadQuery';
import useCreateNonce from 'shared/hooks/useCreateNonce';
import { useGetUsersByWalletAddressesImperatively } from 'shared/hooks/useGetUserByWalletAddress';
import { removeNullValues } from 'shared/relay/removeNullValues';
import { Chain } from 'shared/utils/chains';
import { useLogin } from 'src/hooks/useLogin';

import { useToastActions } from '~/contexts/ToastContext';
import { AuthMechanism } from '~/generated/useLoginMutationMutation.graphql';
import { LoginStackNavigatorProp } from '~/navigation/types';
import { navigateToNotificationUpsellOrHomeScreen } from '~/screens/Login/navigateToNotificationUpsellOrHomeScreen';

const config = {
  rpcUrl: 'https://mainnet.optimism.io',
  // these are purely for message signing. the warpcast app doesn't actually
  // redirect the user back to our mobile app; users need to switch manually
  siweUri: 'https://gallery.so',
  domain: 'gallery.so',
};

export function FarcasterAuthProvider({ children }: { children: ReactNode }) {
  return <AuthKitProvider config={config}>{children}</AuthKitProvider>;
}

export function useLoginWithFarcaster() {
  const getUsersByWalletAddresses = useGetUsersByWalletAddressesImperatively();

  // `setNonce` needs to be called prior to `signIn`.
  // this will be ensured on `initiateConnection`
  const [nonce, setNonce] = useState('');
  const hasRedirectedToWarpcast = useRef(false);
  const createNonce = useCreateNonce();

  const navigation = useNavigation<LoginStackNavigatorProp>();
  const track = useTrack();
  const [login] = useLogin();
  const { pushToast } = useToastActions();
  const reportError = useReportError();

  const handleFarcasterLoginError = useCallback(
    (error?: AuthClientError | Error) => {
      const errorMessage = error?.message ?? 'unknown error';
      pushToast({
        message: `There was an error signing in with Farcaster: ${errorMessage}`,
      });
      reportError('Error signing in with Farcaster', {
        tags: {
          message: errorMessage,
        },
      });
      hasRedirectedToWarpcast.current = false;
    },
    [pushToast, reportError]
  );

  const handleSuccess = useCallback(
    async (req: StatusAPIResponse) => {
      try {
        console.log('success', { req });

        if (!req.custody) {
          throw new Error('no custody address produced from farcaster');
        }
        if (!req.message) {
          throw new Error('no message to sign produced from farcaster');
        }
        if (!req.signature) {
          throw new Error('no signature produced from farcaster');
        }

        const userWallets = removeNullValues([req.custody ?? null, ...(req.verifications ?? [])]);
        console.log('FC connected user wallets', userWallets);

        if (!userWallets.length) {
          throw new Error('no connected wallets for farcaster user');
        }

        // check whether a user exists for any of the connected farcaster wallets
        const userIds = await getUsersByWalletAddresses(
          userWallets.map((address) => ({
            chain: 'Ethereum',
            address,
          }))
        );
        console.log('user IDs', userIds);

        if (!userIds.length) {
          // push to create user
          const primaryFarcasterAddress = req.verifications?.[0] ?? req.custody;
          if (!primaryFarcasterAddress) {
            throw new Error('no connected wallets for farcaster user');
          }

          const createUserAuthMechanism: NeynarPayloadVariables = {
            authMechanismType: 'neynar',
            address: req.custody,
            nonce: req.nonce,
            message: req.message,
            signature: req.signature,
          };

          if (req.verifications?.[0]) {
            createUserAuthMechanism.primaryAddress = req.verifications[0];
          }

          navigation.navigate('OnboardingEmail', {
            authMethod: 'Farcaster',
            authMechanism: createUserAuthMechanism,
          });
          return;
        }
        // push to login
        console.log('--- attempting login!');
        const loginAuthPayload: AuthMechanism = {
          neynar: {
            nonce: req.nonce,
            message: req.message,
            signature: req.signature,
            custodyPubKey: {
              pubKey: req.custody,
              chain: 'Ethereum' as Chain,
            },
          },
        };
        if (req.verifications?.[0]) {
          loginAuthPayload.neynar!.primaryPubKey = {
            pubKey: req.verifications[0],
            chain: 'Ethereum',
          };
        }
        const result = await login(loginAuthPayload);
        console.log('--- login result', { result });
        if (result.kind !== 'success') {
          // it is *extremely unlikely* to end up in this situation bc
          // we determined above through `getUsersByWalletAddresses` that
          // a user does indeed exist
          track('Sign In Failure', { 'Sign in method': 'Farcaster' });
          return;
        }

        // success case
        track('Sign In Success', { 'Sign in method': 'Farcaster' });
        await navigateToNotificationUpsellOrHomeScreen(navigation);
      } catch (e) {
        if (e instanceof Error) {
          handleFarcasterLoginError(e);
        }
      }
    },
    [getUsersByWalletAddresses, handleFarcasterLoginError, login, navigation, track]
  );

  const {
    signIn,
    connect,
    isError: isConnectError,
    reconnect,
    url,
    isConnected,
    isSuccess,
    isPolling,
    data,
    validSignature,
    error,
    channelToken,
  } = useSignIn({
    onSuccess: handleSuccess,
    onError: handleFarcasterLoginError,
    nonce,
  });

  console.log({
    isConnected,
    isConnectError,
    isSuccess,
    isPolling,
    data,
    validSignature,
    url,
    error,
    channelToken,
  });

  const initiateConnection = useCallback(async () => {
    if (!isConnected) {
      const { nonce } = await createNonce();
      setNonce(nonce);

      if (isConnectError) {
        reconnect();
        return;
      }
      await connect();
      console.log('--- connected!');
    }
  }, [connect, createNonce, isConnectError, isConnected, reconnect]);

  useEffect(() => {
    if (url && nonce.length && !isPolling && !isSuccess && !hasRedirectedToWarpcast.current) {
      hasRedirectedToWarpcast.current = true;
      console.log('--- url retrieved, redirecting to warpcast!');
      // at this point, the app will start polling for a signature response,
      // and automatically time out after 5 minutes: https://github.com/farcasterxyz/auth-monorepo/tree/main/packages/auth-kit#parameters
      signIn();
      Linking.openURL(url);
    }
  }, [isPolling, isSuccess, nonce.length, signIn, url]);

  return {
    open: initiateConnection,
  };
}
