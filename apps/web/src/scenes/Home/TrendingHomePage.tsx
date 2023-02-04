import Head from 'next/head';
import { graphql, useFragment } from 'react-relay';

import { FeedPage } from '~/components/Feed/FeedPage';
import TrendingThenGlobalFeed from '~/components/Feed/TrendingThenGlobalFeed';
import { TrendingHomePageFragment$key } from '~/generated/TrendingHomePageFragment.graphql';

type Props = {
  queryRef: TrendingHomePageFragment$key;
};

export default function TrendingHomePage({ queryRef }: Props) {
  const query = useFragment(
    graphql`
      fragment TrendingHomePageFragment on Query {
        ...TrendingThenGlobalFeedFragment
      }
    `,
    queryRef
  );

  return (
    <>
      <Head>
        <title>Gallery | Trending</title>
      </Head>
      <FeedPage>
        <TrendingThenGlobalFeed queryRef={query} />
      </FeedPage>
    </>
  );
}
