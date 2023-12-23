import { useMemo } from 'react';
import { View } from 'react-native';
import { graphql, useFragment } from 'react-relay';

import { CommunityTabsHeaderFragment$key } from '~/generated/CommunityTabsHeaderFragment.graphql';
import { contexts } from '~/shared/analytics/constants';

import { GalleryTabBar } from '../GalleryTabs/GalleryTabBar';

type Props = {
  selectedRoute: string;
  onRouteChange: (value: string) => void;
  communityRef: CommunityTabsHeaderFragment$key;
};

export function CommunityTabsHeader({ selectedRoute, onRouteChange, communityRef }: Props) {
  const community = useFragment(
    graphql`
      fragment CommunityTabsHeaderFragment on Community {
        posts(last: $postLast, before: $postBefore) {
          pageInfo {
            total
          }
        }
        holders(first: $listOwnersFirst, after: $listOwnersAfter) {
          pageInfo {
            total
          }
        }
      }
    `,
    communityRef
  );

  const totalOwners = community.holders?.pageInfo?.total ?? 0;
  const totalPosts = community.posts?.pageInfo?.total ?? 0;

  const routes = useMemo(() => {
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
  }, [totalPosts, totalOwners]);

  return (
    <View>
      <GalleryTabBar
        activeRoute={selectedRoute}
        onRouteChange={onRouteChange}
        routes={routes}
        eventElementId="Community Tab"
        eventName="Community Tab Clicked"
        eventContext={contexts.Community}
      />
    </View>
  );
}
