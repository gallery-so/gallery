import { SigningType } from '@airgap/beacon-types';
import { char2Bytes } from '@taquito/utils';

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

export function getNonceNumber(nonce: string) {
  const splittedNonceMessage = nonce.split(' ');
  return splittedNonceMessage[splittedNonceMessage.length - 1];
}
