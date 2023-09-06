import Head from 'next/head';
import { useRouter } from 'next/router';
import { useCallback } from 'react';
import { graphql, useFragment } from 'react-relay';

import { FeedPage } from '~/components/Feed/FeedPage';
import { LatestFollowingFeed } from '~/components/Feed/LatestFollowingFeed';
import { LatestFollowingPageFragment$key } from '~/generated/LatestFollowingPageFragment.graphql';

type Props = {
  queryRef: LatestFollowingPageFragment$key;
};

export function LatestFollowingPage({ queryRef }: Props) {
  const query = useFragment(
    graphql`
      fragment LatestFollowingPageFragment on Query {
        ...LatestFollowingFeedFragment
      }
    `,
    queryRef
  );

  const { push } = useRouter();
  const handleSeeAllClick = useCallback(() => {
    push({ pathname: '/home' });
  }, [push]);

  return (
    <>
      <Head>
        <title>Gallery | Latest</title>
      </Head>
      <FeedPage>
        <LatestFollowingFeed onSeeAll={handleSeeAllClick} queryRef={query} />
      </FeedPage>
    </>
  );
}
