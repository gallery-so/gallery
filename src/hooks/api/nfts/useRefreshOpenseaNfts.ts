import { usePromisifiedMutation } from 'hooks/usePromisifiedMutation';
import { useCallback } from 'react';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import { removeNullValues } from 'utils/removeNullValues';
import { useRefreshOpenseaNftsFragment$key } from '__generated__/useRefreshOpenseaNftsFragment.graphql';

type Props = {
  viewerRef: useRefreshOpenseaNftsFragment$key;
};

// this will be deprecated once we're off opensea
export default function useRefreshOpenseaNfts({ viewerRef }: Props) {
  const viewer = useFragment(
    graphql`
      fragment useRefreshOpenseaNftsFragment on Viewer {
        user @required(action: THROW) {
          wallets @required(action: THROW) {
            address @required(action: THROW)
          }
        }
      }
    `,
    viewerRef
  );

  const addresses = removeNullValues(viewer.user.wallets)
    .map(({ address }) => address)
    .join(',');

  const [refreshOpenseaNfts] = usePromisifiedMutation(
    graphql`
      mutation useRefreshOpenseaNftsMutation($addresses: String!) {
        refreshOpenSeaNfts(addresses: $addresses) {
          __typename
        }
      }
    `
  );

  return useCallback(async () => {
    await refreshOpenseaNfts({
      variables: {
        addresses,
      },
    });
  }, [refreshOpenseaNfts, addresses]);
}
