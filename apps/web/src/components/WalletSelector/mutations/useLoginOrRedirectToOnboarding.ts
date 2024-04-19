import { useRouter } from 'next/router';
import { startTransition, useCallback, useContext } from 'react';
import { graphql } from 'relay-runtime';

import { useModalActions } from '~/contexts/modal/ModalContext';
import { RelayResetContext } from '~/contexts/RelayResetContext';
import {
  useLoginOrRedirectToOnboardingMutation,
  useLoginOrRedirectToOnboardingMutation$variables,
} from '~/generated/useLoginOrRedirectToOnboardingMutation.graphql';
import { LoginError } from '~/shared/errors/LoginError';
import { usePromisifiedMutation } from '~/shared/relay/usePromisifiedMutation';

export default function useLoginOrRedirectToOnboarding() {
  const [login, isMutating] = usePromisifiedMutation<useLoginOrRedirectToOnboardingMutation>(
    graphql`
      mutation useLoginOrRedirectToOnboardingMutation($mechanism: AuthMechanism!) {
        login(authMechanism: $mechanism) {
          __typename

          ... on LoginPayload {
            userId @required(action: THROW)
          }
          ... on ErrUserNotFound {
            message
          }
          ... on ErrAuthenticationFailed {
            message
          }
          ... on ErrDoesNotOwnRequiredToken {
            message
          }
        }
      }
    `
  );

  type Props = {
    authMechanism: useLoginOrRedirectToOnboardingMutation$variables;
    userExists: boolean;
    userFriendlyWalletName?: string;
    email?: string;
  };

  const { push } = useRouter();

  const { hideModal } = useModalActions();
  const reset = useContext(RelayResetContext);
  const mutate = useCallback(
    async ({
      authMechanism,
      userExists,
      userFriendlyWalletName = 'unknown',
      email,
    }: Props): Promise<string | undefined> => {
      if (userExists) {
        const { login: result } = await login({
          variables: authMechanism,
        });

        if (!result) {
          throw new Error('login failed to execute. response data missing');
        }

        if (result.__typename === 'LoginPayload') {
          hideModal({ id: 'auth' });

          // Wipe the relay cache and show the old content while
          // the new content is loading in the background.
          startTransition(() => {
            reset?.();
          });

          return result.userId;
        }

        if (result && 'message' in result) {
          throw new LoginError(result.message);
        }

        throw new LoginError(`Unexpected type returned from login mutation: ${result?.__typename}`);
      } else {
        // Redirect user to the onboarding flow with necessary input params to create an account
        if (authMechanism.mechanism.eoa) {
          push(
            {
              pathname: '/onboarding/add-email',
              query: {
                authMechanismType: 'eoa',
                chain: authMechanism.mechanism.eoa.chainPubKey.chain,
                address: authMechanism.mechanism.eoa.chainPubKey.pubKey,
                nonce: authMechanism.mechanism.eoa.nonce,
                message: authMechanism.mechanism.eoa.message,
                signature: authMechanism.mechanism.eoa.signature,
                userFriendlyWalletName,
              },
            },
            '/onboarding/add-email'
          );
        }

        if (authMechanism.mechanism.neynar) {
          push(
            {
              pathname: '/onboarding/add-email',
              query: {
                authMechanismType: 'neynar',
                address: authMechanism.mechanism.neynar.custodyPubKey.pubKey,
                primaryAddress: authMechanism.mechanism.neynar.primaryPubKey?.pubKey,
                nonce: authMechanism.mechanism.neynar.nonce,
                message: authMechanism.mechanism.neynar.message,
                signature: authMechanism.mechanism.neynar.signature,
                userFriendlyWalletName,
              },
            },
            '/onboarding/add-email'
          );
        }

        // TODO: this should be privy
        if (authMechanism.mechanism.privy) {
          push(
            {
              pathname: '/onboarding/add-username',
              query: {
                authMechanismType: 'privy',
                token: authMechanism.mechanism.privy.token,
                email,
                userFriendlyWalletName,
              },
            },
            '/onboarding/add-username'
          );
        }

        // De-prioritizing gnosis safe logins for now
        //
        // if (authMechanism.mechanism.gnosisSafe) {
        //   push(
        //     {
        //       pathname: '/onboarding/add-email',
        //       query: {
        //         authMechanismType: 'gnosisSafe',
        //         address: authMechanism.mechanism.gnosisSafe.address,
        //         nonce: authMechanism.mechanism.gnosisSafe.nonce,
        //         message: authMechanism.mechanism.gnosisSafe.message,
        //         userFriendlyWalletName,
        //       },
        //     },
        //     '/onboarding/add-email'
        //   );
        // }

        return;
      }
    },

    // remove `push` from dependency array as it'll trigger this callback to change on route change
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [login]
  );

  return [mutate, isMutating] as const;
}
