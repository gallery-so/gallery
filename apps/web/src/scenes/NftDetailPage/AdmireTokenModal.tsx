import { useMemo } from 'react';
import { graphql, useFragment, usePaginationFragment } from 'react-relay';

import { AdmireModal } from '~/components/Feed/Socialize/AdmireModal/AdmireModal';
//import { AdmireTokenModalFragment$key } from '~/generated/AdmireTokenModalFragment.graphql';
// import { AdmireTokenModalQueryFragment$key } from '~/generated/AdmireTokenModalQueryFragment.graphql';

type Props = {
  fullscreen: boolean;
  queryRef: AdmireTokenModalQueryFragment$key;
  tokenRef: AdmireTokenModalFragment$key;
};

export function AdmireTokenModal({ tokenRef, queryRef, fullscreen }: Props) {
  const {
    data: token,
    loadPrevious,
    hasPrevious,
  } = usePaginationFragment(
    graphql`
      fragment AdmireTokenModalFragment on Token
      @refetchable(queryName: "AdmireTokenModalRefetchableFragment") {
        admires(last: $interactionsFirst, before: $interactionsAfter)
          @connection(key: "AdmiresModal_admires") {
          edges {
            node {
              __typename

              ... on Admire {
                ...AdmireModalFragment
              }
            }
          }
        }
      }
    `,
    tokenRef
  );

  const query = useFragment(
    graphql`
      fragment AdmireTokenModalQueryFragment on Query {
        ...AdmireModalQueryFragment
      }
    `,
    queryRef
  );

  const nonNullAdmires = useMemo(() => {
    const admires = [];

    for (const admire of token.admires?.edges ?? []) {
      if (admire?.node && admire.node.__typename === 'Admire') {
        admires.push(admire.node);
      }
    }

    return admires.reverse();
  }, [token.admires?.edges]);
  return (
    <AdmireModal
      admireRefs={nonNullAdmires}
      queryRef={query}
      fullscreen={fullscreen}
      loadPrevious={loadPrevious}
      hasPrevious={hasPrevious}
    />

  );
}
