import {
  AuthClientError,
  AuthKitProvider,
  QRCode,
  StatusAPIResponse,
  useSignIn,
} from '@farcaster/auth-kit';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTrack } from 'shared/contexts/AnalyticsContext';
import { useReportError } from 'shared/contexts/ErrorReportingContext';
import useCreateNonce from 'shared/hooks/useCreateNonce';
import { useGetUsersByWalletAddressesImperatively } from 'shared/hooks/useGetUserByWalletAddress';
import { removeNullValues } from 'shared/relay/removeNullValues';
import { Chain } from 'shared/utils/chains';
import styled from 'styled-components';

import Loader from '~/components/core/Loader/Loader';
import { VStack } from '~/components/core/Spacer/Stack';
import { BaseXL } from '~/components/core/Text/Text';
import { useToastActions } from '~/contexts/toast/ToastContext';
import { AuthMechanism } from '~/generated/useLoginOrRedirectToOnboardingMutation.graphql';

import useLoginOrRedirectToOnboarding from '../mutations/useLoginOrRedirectToOnboarding';

const config = {
  rpcUrl: 'https://mainnet.optimism.io',
  // these are purely for message signing. in a mobile environment, the warpcast app
  // doesn't actually redirect the user back to the gallery mobile app; users need to
  // switch apps manually. requested the farcaster team for a redirect mechanism.
  siweUri: 'https://gallery.so',
  domain: 'gallery.so',
};

export function ConnectedFarcasterLoginView() {
  return (
    <AuthKitProvider config={config}>
      <FarcasterLoginView />
    </AuthKitProvider>
  );
}

export function FarcasterLoginView() {
  const [nonce, setNonce] = useState('');
  const createNonce = useCreateNonce();
  const hasRedirectedToWarpcast = useRef(false);

  const { pushToast } = useToastActions();
  const reportError = useReportError();

  const handleFarcasterLoginError = useCallback(
    (error?: AuthClientError | Error) => {
      const errorMessage = error?.message ?? 'unknown error';
      console.log('the error', error);
      if (errorMessage !== 'Polling') {
        pushToast({
          message: `There was an error signing in with Farcaster: ${errorMessage}`,
        });
      }
      reportError('Error signing in with Farcaster', {
        tags: {
          message: errorMessage,
        },
      });
      hasRedirectedToWarpcast.current = false;
    },
    [pushToast, reportError]
  );

  const getUsersByWalletAddresses = useGetUsersByWalletAddressesImperatively();
  const [loginOrRedirectToOnboarding] = useLoginOrRedirectToOnboarding();

  const track = useTrack();

  const handleSuccess = useCallback(
    async (req: StatusAPIResponse) => {
      try {
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

        const primaryFarcasterAddress = req.verifications?.[0] ?? req.custody;
        if (!primaryFarcasterAddress) {
          throw new Error('no connected wallets for farcaster user');
        }

        const loginOrCreateUserAuthPayload: AuthMechanism = {
          neynar: {
            nonce: req.nonce,
            message: req.message,
            signature: req.signature,
            custodyPubKey: {
              pubKey: req.custody,
              chain: 'Ethereum' as Chain,
            },
            primaryPubKey: {
              pubKey: primaryFarcasterAddress,
              chain: 'Ethereum' as Chain,
            },
          },
        };

        if (!userIds.length) {
          // push to create user
          track('Redirect to create user onboarding', { 'Sign in method': 'Farcaster' });
          await loginOrRedirectToOnboarding({
            authMechanism: {
              mechanism: loginOrCreateUserAuthPayload,
            },
            userExists: false,
            userFriendlyWalletName: 'Farcaster',
          });
          return;
        }

        // push to login
        const userId = await loginOrRedirectToOnboarding({
          authMechanism: {
            mechanism: loginOrCreateUserAuthPayload,
          },
          userExists: true,
          userFriendlyWalletName: 'Farcaster',
        });

        if (userId) {
          track('Sign In Success', { 'Sign in method': 'Farcaster' });
          return;
        }
        // error case will be handled thrown in `loginOrRedirectToOnboarding`
      } catch (e) {
        if (e instanceof Error) {
          handleFarcasterLoginError(e);
        }
      }
    },
    [getUsersByWalletAddresses, handleFarcasterLoginError, loginOrRedirectToOnboarding, track]
  );

  const {
    signIn: initiateFarcasterSignIn,
    isError: isConnectError,
    isConnected,
    connect,
    reconnect,
    url,
    appClient,
  } = useSignIn({
    onError: handleFarcasterLoginError,
    onSuccess: handleSuccess,
    nonce,
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
    }
  }, [connect, createNonce, isConnectError, isConnected, reconnect]);

  useEffect(() => {
    // prepares the appClient for connection. this triggers the following effect.
    initiateConnection();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if ((nonce.length, appClient && isConnected && !hasRedirectedToWarpcast.current)) {
      hasRedirectedToWarpcast.current = true;
      // at this point, the app will start polling for a signature response,
      // and automatically time out after 5 minutes: https://github.com/farcasterxyz/auth-monorepo/tree/main/packages/auth-kit#parameters
      initiateFarcasterSignIn();
    }
  }, [appClient, initiateFarcasterSignIn, isConnected, nonce.length]);

  return (
    <VStack gap={24} justify="center" align="center">
      <FarcasterQrCodeStyleContainer justify="center" align="center">
        {url ? <QRCode uri={url} logoSize={30} size={300} /> : <Loader size="small" />}
      </FarcasterQrCodeStyleContainer>
      <BaseXL>Scan with your phone's camera to continue.</BaseXL>
    </VStack>
  );
}

// logo placement is messed up out of the box in authkit
const FarcasterQrCodeStyleContainer = styled(VStack)`
  position: relative;

  height: 264px;

  svg:first-of-type {
    position: absolute;
    top: 121px;
    left: 119px;
  }
`;
