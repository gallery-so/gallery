import Head from 'next/head';
import { graphql, useFragment } from 'react-relay';

import CuratedFeed from '~/components/Feed/CuratedFeed';
import { FeedPage } from '~/components/Feed/FeedPage';
import { CuratedHomePageFragment$key } from '~/generated/CuratedHomePageFragment.graphql';

type Props = {
  queryRef: CuratedHomePageFragment$key;
};

export default function CuratedHomePage({ queryRef }: Props) {
  const query = useFragment(
    graphql`
      fragment CuratedHomePageFragment on Query {
        ...CuratedFeedFragment
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
        <CuratedFeed queryRef={query} />
      </FeedPage>
    </>
  );
}
