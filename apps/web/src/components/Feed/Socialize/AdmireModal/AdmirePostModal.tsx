import { useMemo } from 'react';
import { graphql, useFragment, usePaginationFragment } from 'react-relay';

import { AdmirePostModalFragment$key } from '~/generated/AdmirePostModalFragment.graphql';
import { AdmirePostModalQueryFragment$key } from '~/generated/AdmirePostModalQueryFragment.graphql';

import { AdmireModal } from './AdmireModal';

type Props = {
  fullscreen: boolean;
  queryRef: AdmirePostModalQueryFragment$key;
  postRef: AdmirePostModalFragment$key;
};

export function AdmirePostModal({ postRef, queryRef, fullscreen }: Props) {
  const {
    data: post,
    loadPrevious,
    hasPrevious,
  } = usePaginationFragment(
    graphql`
      fragment AdmirePostModalFragment on Post
      @refetchable(queryName: "AdmirePostModalRefetchableFragment") {
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
    postRef
  );

  const query = useFragment(
    graphql`
      fragment AdmirePostModalQueryFragment on Query {
        ...AdmireModalQueryFragment
      }
    `,
    queryRef
  );

  const nonNullAdmires = useMemo(() => {
    const admires = [];

    for (const admire of post.admires?.edges ?? []) {
      if (admire?.node && admire.node.__typename === 'Admire') {
        admires.push(admire.node);
      }
    }

    return admires.reverse();
  }, [post.admires?.edges]);

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
