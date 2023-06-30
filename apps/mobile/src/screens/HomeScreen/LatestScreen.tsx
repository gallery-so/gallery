import AsyncStorage from '@react-native-async-storage/async-storage';
import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { graphql, useFragment, useLazyLoadQuery } from 'react-relay';

import { FEED_PER_PAGE } from '~/components/Feed/constants';
import { ActiveFeed } from '~/components/Feed/FeedFilter';
import { FollowingFeed } from '~/components/Feed/FollowingFeed';
import { WelcomeToBeta } from '~/components/WelcomeToBeta';
import { LatestScreenFragment$key } from '~/generated/LatestScreenFragment.graphql';
import { LatestScreenQuery } from '~/generated/LatestScreenQuery.graphql';

import { LoadingFeedList } from '../../components/Feed/LoadingFeedList';
import { WorldwideFeed } from '../../components/Feed/WorldwideFeed';

type LatestScreenInnerProps = {
  queryRef: LatestScreenFragment$key;
};

function LatestScreenInner({ queryRef }: LatestScreenInnerProps) {
  const query = useFragment(
    graphql`
      fragment LatestScreenFragment on Query {
        ...FollowingFeedFragment
        ...WorldwideFeedFragment

        viewer {
          ... on Viewer {
            user {
              username
            }
          }
        }
      }
    `,
    queryRef
  );

  const [activeFeed, setActiveFeed] = useState<ActiveFeed>('Worldwide');

  const [showWelcome, setShowWelcome] = useState(false);

  const checkShouldShowWelcome = useCallback(async () => {
    const shown = await AsyncStorage.getItem('welcomeMessageShown');
    if (shown !== 'true') {
      setShowWelcome(true);
      await AsyncStorage.setItem('welcomeMessageShown', 'true');
    }
  }, [setShowWelcome]);

  useEffect(() => {
    checkShouldShowWelcome();
  }, [checkShouldShowWelcome]);

  const FeedComponent = useMemo(() => {
    if (activeFeed === 'Following') {
      return <FollowingFeed queryRef={query} onChangeFeedMode={setActiveFeed} />;
    } else {
      return <WorldwideFeed queryRef={query} onChangeFeedMode={setActiveFeed} />;
    }
  }, [activeFeed, query]);

  return (
    <>
      {FeedComponent}
      {showWelcome && <WelcomeToBeta username={query.viewer?.user?.username ?? ''} />}
    </>
  );
}

export function LatestScreen() {
  const query = useLazyLoadQuery<LatestScreenQuery>(
    graphql`
      query LatestScreenQuery(
        $globalFeedBefore: String
        $globalFeedCount: Int!
        $followingFeedBefore: String
        $followingFeedCount: Int!
      ) {
        ...LatestScreenFragment
      }
    `,
    {
      globalFeedCount: FEED_PER_PAGE,
      followingFeedCount: FEED_PER_PAGE,
    }
  );

  return (
    <Suspense fallback={<LoadingFeedList />}>
      <LatestScreenInner queryRef={query} />
    </Suspense>
  );
}
