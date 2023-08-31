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

export default function CommunityPagePostCycle({
  queryRef,
  postRefs,
  loadNextPage,
  hasNext,
}: Props) {
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

  // useEffect(() => {
  //   const intervalId = setInterval(() => {
  //     setDisplayedPostIndex((prevIndex) => {
  //       // If we've shown all posts, start from 0 again
  //       console.log(prevIndex, postsData.length);
  //       if (prevIndex >= postsData.length - 1) {
  //         console.log('resetting', postsData.length);
  //         return 0;
  //       }
  //       return prevIndex + 1;
  //     });

  //     // if we're about to set the last index, load more posts
  //   }, 5000);

  //   return () => clearInterval(intervalId);
  // });

  useEffect(() => {
    console.log('displayedPostIndex changed: ', displayedPostIndex);
    console.log('postsData.length: ', postsData.length);
    console.log('hasNext: ', hasNext);
    console.log({ postsData });
    console.log(postsData[displayedPostIndex]);
    if (displayedPostIndex === postsData.length - 1 && hasNext) {
      console.log('loading next page');
      // loadNextPage();
    }
  }, [displayedPostIndex, hasNext, loadNextPage, postsData, postsData.length]);

  return (
    <PostItem
      eventRef={postsData[displayedPostIndex]}
      queryRef={query}
      bigScreenMode={true}
    ></PostItem>
  );
}
