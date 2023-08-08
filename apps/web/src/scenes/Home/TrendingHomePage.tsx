import Head from 'next/head';
import { graphql, useFragment } from 'react-relay';

import CuratedThenGlobalFeed from '~/components/Feed/CuratedThenGlobalFeed';
import { FeedPage } from '~/components/Feed/FeedPage';
import { TrendingHomePageFragment$key } from '~/generated/TrendingHomePageFragment.graphql';

type Props = {
  queryRef: TrendingHomePageFragment$key;
};

export default function TrendingHomePage({ queryRef }: Props) {
  const query = useFragment(
    graphql`
      fragment TrendingHomePageFragment on Query {
        ...CuratedThenGlobalFeedFragment
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
        <CuratedThenGlobalFeed queryRef={query} />
      </FeedPage>
    </>
  );
}
