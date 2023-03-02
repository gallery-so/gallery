import { SigningType } from '@airgap/beacon-types';
import { captureException } from '@sentry/nextjs';
import { char2Bytes } from '@taquito/utils';

import { ErrorWithSentryMetadata } from '~/shared/errors/ErrorWithSentryMetadata';
import { BeaconError } from '~/types/Error';

export function generatePayload(nonce: string, address: string) {
  const formattedInput: string = ['Tezos Signed Message:', nonce].join(' ');

  // https://tezostaquito.io/docs/signing
  const bytes = char2Bytes(formattedInput);
  const payloadBytes = '05' + '01' + '00' + char2Bytes(bytes.length.toString()) + bytes;

  return {
    signingType: SigningType.MICHELINE,
    payload: payloadBytes,
    sourceAddress: address,
  };
}

export function getNonceNumber(nonce: string): string {
  const splittedNonceMessage = nonce.split(' ');
  const nonceNumber = splittedNonceMessage[splittedNonceMessage.length - 1];

  if (!nonceNumber) {
    const error = new ErrorWithSentryMetadata('Could not parse nonce number', { nonce });
    captureException(error);
    throw error;
  }

  return nonceNumber;
}

export function getErrorCode(error: BeaconError) {
  // https://typedocs.walletbeacon.io/enums/beaconerrortype.html
  // Example: [ABORTED_ERROR]:The action was aborted by the user.
  const leftHandOfColon = error.message.split(':')[0];

  return leftHandOfColon?.replace('[', '').replace(']', '');
}
