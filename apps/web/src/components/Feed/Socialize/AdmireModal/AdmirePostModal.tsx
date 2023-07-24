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
        interactions(last: $interactionsFirst, before: $interactionsAfter)
          @connection(key: "AdmiresModal_interactions") {
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

  const nonNullInteractions = useMemo(() => {
    const interactions = [];

    for (const interaction of post.interactions?.edges ?? []) {
      // todo pagination query on Admire instead of Interaction so that we dont have to check for type here
      if (interaction?.node && interaction.node.__typename === 'Admire') {
        interactions.push(interaction.node);
      }
    }

    return interactions.reverse();
  }, [post.interactions?.edges]);

  return (
    <AdmireModal
      admireRefs={nonNullInteractions}
      queryRef={query}
      fullscreen={fullscreen}
      loadPrevious={loadPrevious}
      hasPrevious={hasPrevious}
    />
  );
}
