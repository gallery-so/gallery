import { useEffect, useState } from 'react';
import { graphql, useFragment } from 'react-relay';

import { PostItemWithBoundary as PostItem } from '~/components/Feed/PostItem';
import { CommunityPagePostCycleFragment$key } from '~/generated/CommunityPagePostCycleFragment.graphql';
import { CommunityPagePostCycleQueryFragment$key } from '~/generated/CommunityPagePostCycleQueryFragment.graphql';

type Props = {
  loadNextPage: () => void;
  hasNext: boolean;
  queryRef: CommunityPagePostCycleQueryFragment$key;
  postRefs: CommunityPagePostCycleFragment$key;
};

export default function CommunityPagePostCycle({ queryRef, postRefs }: Props) {
  const query = useFragment(
    graphql`
      fragment CommunityPagePostCycleQueryFragment on Query {
        ...PostItemWithErrorBoundaryQueryFragment
      }
    `,
    queryRef
  );

  const postsData = useFragment(
    graphql`
      fragment CommunityPagePostCycleFragment on Post @relay(plural: true) {
        __typename
        ...PostItemWithErrorBoundaryFragment
      }
    `,
    postRefs
  );

  console.log({ postsData });

  const [displayedPostIndex, setDisplayedPostIndex] = useState(0);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setDisplayedPostIndex((prevIndex) => {
        // If we've shown all posts, start from 0 again
        console.log(prevIndex, postsData.length);
        if (prevIndex >= postsData.length - 1) {
          return 0;
        }
        return prevIndex + 1;
      });
    }, 5000);

    return () => clearInterval(intervalId);
  });

  return <PostItem eventRef={postsData[displayedPostIndex]} queryRef={query}></PostItem>;
}
