import { useCallback } from 'react';
import { graphql } from 'relay-runtime';

import { useCreateNonceMutation } from '~/generated/useCreateNonceMutation.graphql';

import { usePromisifiedMutation } from '../relay/usePromisifiedMutation';

/**
 * Retrieve a nonce for the client to sign given a wallet address.
 * Endpoint will also notify whether the user exists or not, so the
 * client can login or signup accordingly
 */
type NonceResponse = {
  nonce: string;
  message: string;
};

export default function useCreateNonce() {
  const [createNonce] = usePromisifiedMutation<useCreateNonceMutation>(
    graphql`
      mutation useCreateNonceMutation {
        getAuthNonce {
          __typename

          ... on AuthNonce {
            nonce @required(action: THROW)
            message @required(action: THROW)
          }
        }
      }
    `
  );

  return useCallback(async (): Promise<NonceResponse> => {
    // Kick off the mutation network request
    //
    // This call can throw an error. This error is the equivalent
    // of either a 500, or a network error (the user didn't have connection)
    //
    // If this throws, we'll just let the UI handle that appropriately
    // with it's try catch
    const { getAuthNonce } = await createNonce({ variables: {} });

    // If the server didn't give us a payload for the mutation we just committed,
    // we'll throw an error with a somewhat helpful message. This usually means
    // the server panicked at some point in the stack and was unable to commit
    // the mutation.
    if (!getAuthNonce) {
      throw new Error('getAuthNonce failed to execute. response data missing');
    }

    // Same thing here. If the response's typename is AuthNonce
    // that means the type has a nonce, and userExists field
    if (getAuthNonce?.__typename === 'AuthNonce') {
      return { nonce: getAuthNonce.nonce, message: getAuthNonce.message };
    }

    // The server added some new type to the union and we don't know what to do.
    throw new Error(
      `Unexpected type returned from createNonceMutation: ${getAuthNonce.__typename}`
    );
  }, [createNonce]);
}
