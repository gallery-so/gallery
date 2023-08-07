import { useMemo } from 'react';
import { View } from 'react-native';
import { graphql, useFragment } from 'react-relay';
import isFeatureEnabled, { FeatureFlag } from 'src/utils/isFeatureEnabled';

import { CommunityTabsHeaderFragment$key } from '~/generated/CommunityTabsHeaderFragment.graphql';
import { CommunityTabsHeaderQueryFragment$key } from '~/generated/CommunityTabsHeaderQueryFragment.graphql';

import { GalleryTabBar } from '../GalleryTabs/GalleryTabBar';

type Props = {
  selectedRoute: string;
  onRouteChange: (value: string) => void;
  communityRef: CommunityTabsHeaderFragment$key;
  queryRef: CommunityTabsHeaderQueryFragment$key;
};

export function CommunityTabsHeader({
  selectedRoute,
  onRouteChange,
  communityRef,
  queryRef,
}: Props) {
  const community = useFragment(
    graphql`
      fragment CommunityTabsHeaderFragment on Community {
        posts(first: $postLast, after: $postBefore) {
          pageInfo {
            total
          }
        }
        owners(
          first: $listOwnersFirst
          after: $listOwnersAfter
          onlyGalleryUsers: $onlyGalleryUsers
        ) {
          pageInfo {
            total
          }
        }
      }
    `,
    communityRef
  );

  const query = useFragment(
    graphql`
      fragment CommunityTabsHeaderQueryFragment on Query {
        ...isFeatureEnabledFragment
      }
    `,
    queryRef
  );

  const isKoalaEnabled = isFeatureEnabled(FeatureFlag.KOALA, query);

  const totalOwners = community.owners?.pageInfo?.total ?? 0;
  const totalPosts = community.posts?.pageInfo?.total ?? 0;

  const routes = useMemo(() => {
    if (!isKoalaEnabled) {
      return [
        {
          name: 'Collectors',
          counter: totalOwners,
        },
      ];
    }

    return [
      {
        name: 'Posts',
        counter: totalPosts,
      },
      {
        name: 'Collectors',
        counter: totalOwners,
      },
    ];
  }, [isKoalaEnabled, totalPosts, totalOwners]);

  return (
    <View>
      <GalleryTabBar
        activeRoute={selectedRoute}
        onRouteChange={onRouteChange}
        routes={routes}
        eventElementId="Community Tab"
        eventName="Community Tab Clicked"
      />
    </View>
  );
}
