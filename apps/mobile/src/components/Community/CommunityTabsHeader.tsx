import { useMemo } from 'react';
import { View } from 'react-native';
import { graphql, useFragment } from 'react-relay';

import { CommunityTabsHeaderFragment$key } from '~/generated/CommunityTabsHeaderFragment.graphql';

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

  const totalOwners = community.owners?.pageInfo?.total ?? 0;
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
      />
    </View>
  );
}
