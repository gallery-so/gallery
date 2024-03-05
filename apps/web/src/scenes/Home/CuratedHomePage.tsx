import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { graphql, useFragment } from 'react-relay';

import CuratedFeed from '~/components/Feed/CuratedFeed';
import { FeedPage } from '~/components/Feed/FeedPage';
import { WelcomeNewUser } from '~/components/Onboarding/WelcomeNewUser';
import { CuratedHomePageFragment$key } from '~/generated/CuratedHomePageFragment.graphql';

type Props = {
  queryRef: CuratedHomePageFragment$key;
};

export default function CuratedHomePage({ queryRef }: Props) {
  const query = useFragment(
    graphql`
      fragment CuratedHomePageFragment on Query {
        ...CuratedFeedFragment
        ...WelcomeNewUserFragment
      }
    `,
    queryRef
  );

  const [showWelcome, setShowWelcome] = useState(false);

  const { query: urlQuery } = useRouter();
  const { onboarding } = urlQuery;

  useEffect(() => {
    if (onboarding) {
      setShowWelcome(true);
    }
  }, [onboarding]);

  return (
    <>
      <Head>
        <title>Gallery | Trending</title>
      </Head>
      {showWelcome && createPortal(<WelcomeNewUser queryRef={query} />, document.body)}
      <FeedPage>
        <CuratedFeed queryRef={query} />
      </FeedPage>
    </>
  );
}
