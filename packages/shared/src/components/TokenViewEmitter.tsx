import { Suspense, useEffect } from 'react';
import { graphql } from 'relay-runtime';

import { TokenViewEmitterMutation } from '~/generated/TokenViewEmitterMutation.graphql';

import { useReportError } from '../contexts/ErrorReportingContext';
import { usePromisifiedMutation } from '../relay/usePromisifiedMutation';

type TokenViewEmitterProps = {
  collectionID: string;
  tokenID: string;
};

function TokenViewEmitter({ collectionID, tokenID }: TokenViewEmitterProps) {
  const [viewToken] = usePromisifiedMutation<TokenViewEmitterMutation>(graphql`
    mutation TokenViewEmitterMutation($tokenID: DBID!, $collectionID: DBID!) {
      viewToken(tokenID: $tokenID, collectionID: $collectionID) {
        __typename
      }
    }
  `);

  const reportError = useReportError();

  useEffect(() => {
    if (!tokenID || !collectionID) {
      return;
    }

    viewToken({ variables: { tokenID, collectionID } }).catch((error) => {
      if (error instanceof Error) {
        reportError(error);
      } else {
        reportError(
          'Something unexpected went wrong while trying to submit the `viewToken` mutation'
        );
      }
    });
  }, [tokenID, collectionID, reportError, viewToken]);

  return null;
}

type TokenViewEmitterWithSuspenseProps = {
  collectionID: string;
  tokenID: string;
};

function TokenViewEmitterWithSuspense({
  tokenID,
  collectionID,
}: TokenViewEmitterWithSuspenseProps) {
  return (
    <Suspense fallback={null}>
      <TokenViewEmitter tokenID={tokenID} collectionID={collectionID} />
    </Suspense>
  );
}

export default TokenViewEmitterWithSuspense;
