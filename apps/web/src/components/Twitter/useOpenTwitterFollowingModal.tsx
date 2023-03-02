import { useRouter } from 'next/router';
import { useEffect, useRef } from 'react';
import { graphql, useFragment } from 'react-relay';

import { useModalActions } from '~/contexts/modal/ModalContext';
import { useOpenTwitterFollowingModalFragment$key } from '~/generated/useOpenTwitterFollowingModalFragment.graphql';

import TwitterFollowingModal from './TwitterFollowingModal';

export default function useOpenTwitterFollowingModal(
  queryRef: useOpenTwitterFollowingModalFragment$key
) {
  const query = useFragment(
    graphql`
      fragment useOpenTwitterFollowingModalFragment on Query {
        viewer {
          __typename
        }

        socialConnections(
          before: $twitterListBefore
          last: $twitterListLast
          socialAccountType: Twitter
        ) @connection(key: "TwitterFollowingModal__socialConnections") {
          edges {
            __typename
          }
        }

        ...TwitterFollowingModalFragment
        ...TwitterFollowingModalQueryFragment
      }
    `,
    queryRef
  );

  const router = useRouter();
  const { showModal } = useModalActions();

  const { query: routerQuery } = router;
  const { twitter } = routerQuery;

  const isLoggedIn = query.viewer?.__typename === 'Viewer';

  const isTwitterModalOpen = useRef(false);

  const totalTwitterConnections = query.socialConnections?.edges?.length ?? 0;

  useEffect(() => {
    if (!isLoggedIn) {
      return;
    }

    if (totalTwitterConnections === 0) {
      return;
    }

    if (twitter === 'true' && !isTwitterModalOpen.current) {
      isTwitterModalOpen.current = true;
      showModal({
        content: <TwitterFollowingModal queryRef={query} followingRef={query} />,
      });
    }
  }, [isLoggedIn, query, showModal, totalTwitterConnections, twitter]);
}
