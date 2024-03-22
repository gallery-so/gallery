/* eslint-disable no-console */
import {
  AuthClientError,
  AuthKitProvider,
  StatusAPIResponse,
  useSignIn,
} from '@farcaster/auth-kit';
import { ReactNode, useCallback, useEffect, useState } from 'react';
import { Linking } from 'react-native';
import { useGetUserByWalletAddressImperatively } from 'shared/hooks/useGetUserByWalletAddress';
import { removeNullValues } from 'shared/relay/removeNullValues';

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
  const getUserByWalletAddress = useGetUserByWalletAddressImperatively();

  const handleSuccess = useCallback(
    async (req: StatusAPIResponse) => {
      try {
        // should contain req.message, req.nonce, req.signature, etc. to send to new AuthMechanism
        console.log('success', { req });

        const userWallets = removeNullValues([req.custody ?? null, ...(req.verifications ?? [])]);
        if (!userWallets.length) {
          throw new Error(
            'something went very, terribly wrong! the farcaster user has no wallet addresses'
          );
        }

        // check whether a user exists for any of the wallets.
        // break as soon as we find one.
        let dbid: string | null = null;
        for (const wallet of userWallets) {
          dbid = await getUserByWalletAddress({
            chain: 'Ethereum',
            address: wallet,
          });
          if (dbid) {
            break;
          }
        }

        if (!dbid) {
          // push to create user
          return;
        }
        // push to create login
      } catch (e) {
        // TODO error handle
        console.log('caught in success', e);
      }
    },
    [getUserByWalletAddress]
  );

  const handleError = useCallback((error?: AuthClientError) => {
    // TODO error handle
    console.log('error', error);
  }, []);

  // `setNonce` needs to be called prior to `signIn`.
  // this will be ensured on `initiateConnection`
  const [nonce, setNonce] = useState('');

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
    onError: handleError,
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
      // TODO! get nonce from new server mutation
      // setNonce(await generateNonce())
      setNonce('some_value_from_server');

      if (isConnectError) {
        reconnect();
        return;
      }
      await connect();
      console.log('--- connected!');
    }
  }, [connect, isConnectError, isConnected, reconnect]);

  useEffect(() => {
    if (url && nonce.length && !isPolling && !isSuccess) {
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
