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

  const totalOwners = useMemo(() => {
    return community.owners?.pageInfo?.total ?? 0;
  }, [community.owners?.pageInfo?.total]);

  const routes = useMemo(() => {
    return [
      {
        name: 'Posts',
      },
      {
        name: 'Collectors',
        counter: totalOwners,
      },
    ];
  }, [totalOwners]);

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
