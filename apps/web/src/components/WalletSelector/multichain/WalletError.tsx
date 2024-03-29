import { BeaconErrorType } from '@airgap/beacon-types';
import { useMemo } from 'react';
import { UserRejectedRequestError } from 'viem';

import { isEarlyAccessError } from '~/contexts/analytics/authUtil';
import { isWeb3Error } from '~/types/Error';

import { WalletSelectorError } from './WalletSelectorError';

type ErrorMessage = {
  heading: string;
  body: string;
};

// TODO: consider making these enums
const ERROR_MESSAGES: Record<string, ErrorMessage> = {
  // Client-side provider errors: https://eips.ethereum.org/EIPS/eip-1193#provider-errors
  UNSUPPORTED_CHAIN: {
    heading: 'Authorization error',
    body: 'The selected chain is unsupported. We currently only support the Ethereum network.',
  },
  REJECTED_SIGNATURE: {
    heading: 'Signature rejected',
    body: 'The signature was rejected. Try again or use another wallet.',
  },
  USER_SIGNUP_DISABLED: {
    heading: 'Coming Soon',
    body: "We've detected a Gallery Member Card in your wallet! You'll be able to use it to create an account with us soon.\n\n For further updates, find us on Twitter or join our Discord.",
  },
  EXISTING_USER: {
    heading: 'This address is already associated with an existing user.',
    body: 'Sign in with that address',
  },
  NO_COOKIE: {
    heading: 'Cookie not found',
    body: 'A cookie was not properly set from the login flow. This issue may be related to CORS. Please try a different browser, and reach out to us on Twitter or Discord if you continue to see this error.',
  },
  UNKNOWN_ERROR: {
    heading: 'There was an error connecting',
    body: 'Please try again.',
  },
};

function getErrorMessage(errorCode: string): ErrorMessage {
  return ERROR_MESSAGES[errorCode] ?? (ERROR_MESSAGES.UNKNOWN_ERROR as ErrorMessage);
}

type Props = {
  address?: string | null;
  error: Error;
  reset: () => void;
};

export const WalletError = ({ address, error, reset }: Props) => {
  const displayedError = useMemo(() => {
    if (error instanceof UserRejectedRequestError) {
      return getErrorMessage('REJECTED_SIGNATURE');
    }

    if (isWeb3Error(error)) {
      if (error.code === 'GALLERY_SERVER_ERROR') {
        if (!isEarlyAccessError(error)) {
          return {
            heading: address?.toLowerCase() ?? 'Unknown Wallet',
            body: 'Your wallet address is not on the **Early Access Allowlist**. To get onto the allowlist, visit our [FAQ](https://gallery-so.notion.site/Gallery-FAQ-b5ee57c1d7f74c6695e42c84cb6964ba#6fa1bc2983614500a206fc14fcfd61bf) or reach out to us on [Discord](discord.gg/vBqBEH8GaM).',
          };
        }

        return {
          heading: 'Authorization error',
          body: error.message,
        };
      }

      if (error.code === BeaconErrorType.ABORTED_ERROR) {
        return getErrorMessage('REJECTED_SIGNATURE');
      }

      if (error.code) {
        return getErrorMessage(error.code);
      }
    }

    return getErrorMessage('UNKNOWN_ERROR');
  }, [address, error]);

  if (displayedError === ERROR_MESSAGES.UNKNOWN_ERROR) {
    console.log(error);
  }

  return (
    <WalletSelectorError
      heading={displayedError.heading}
      body={displayedError.body}
      reset={reset}
    />
  );
};
