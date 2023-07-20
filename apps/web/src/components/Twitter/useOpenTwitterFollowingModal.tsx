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
          after: $twitterListAfter
          first: $twitterListFirst
          socialAccountType: Twitter
          excludeAlreadyFollowing: false
        ) @connection(key: "TwitterFollowingModal__socialConnections") {
          # Relay requires that we grab the edges field if we use the connection directive
          # We're selecting __typename since that shouldn't have a cost
          # eslint-disable-next-line relay/unused-fields
          edges {
            __typename
          }
          pageInfo {
            total
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

  const totalTwitterConnections = query.socialConnections?.pageInfo?.total ?? 0;

  useEffect(() => {
    if (!isLoggedIn || totalTwitterConnections === 0) {
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
