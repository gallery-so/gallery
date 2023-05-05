import { useCallback } from 'react';
import { graphql } from 'relay-runtime';

import { useGenerateMobileOTPTokenMutation } from '~/generated/useGenerateMobileOTPTokenMutation.graphql';
import { usePromisifiedMutation } from '~/shared/relay/usePromisifiedMutation';

export default function useGenerateMobileOTPToken() {
  const [generateToken] = usePromisifiedMutation<useGenerateMobileOTPTokenMutation>(
    graphql`
      mutation useGenerateMobileOTPTokenMutation {
        generateQRCodeLoginToken {
          __typename

          ... on GenerateQRCodeLoginTokenPayload {
            token
          }

          ... on ErrNotAuthorized {
            message
          }
        }
      }
    `
  );

  return useCallback(async () => {
    const { generateQRCodeLoginToken: result } = await generateToken({ variables: {} });

    if (!result) {
      throw new Error('token generation failed to execute; check the network tab for more info');
    }

    if (result.__typename === 'GenerateQRCodeLoginTokenPayload') {
      return result.token;
    }

    if (result.__typename === 'ErrNotAuthorized') {
      throw new Error(result.message);
    }

    throw new Error('fatal error: how did we get here?!');
  }, [generateToken]);
}
