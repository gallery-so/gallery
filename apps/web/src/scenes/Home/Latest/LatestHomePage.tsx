import Head from 'next/head';
import { graphql, useFragment } from 'react-relay';

import { FeedPage } from '~/components/Feed/FeedPage';
import { LatestFeed } from '~/components/Feed/LatestFeed';
import { LatestHomePageFragment$key } from '~/generated/LatestHomePageFragment.graphql';
import { FollowingToggleSection } from '~/scenes/Home/Latest/FollowingToggleSection';

type Props = {
  queryRef: LatestHomePageFragment$key;
};

export function LatestHomePage({ queryRef }: Props) {
  const query = useFragment(
    graphql`
      fragment LatestHomePageFragment on Query {
        ...LatestFeedFragment
        viewer {
          ... on Viewer {
            user {
              id
            }
          }
        }
      }
    `,
    queryRef
  );

  const isAuthenticated = Boolean(query.viewer?.user?.id);

  return (
    <>
      <Head>
        <title>Gallery | Latest</title>
      </Head>
      <FeedPage>
        {isAuthenticated && <FollowingToggleSection active={false} />}
        <LatestFeed queryRef={query} />
      </FeedPage>
    </>
  );
}
