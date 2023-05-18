import { useNavigation } from '@react-navigation/native';
import { ListRenderItem } from '@shopify/flash-list';
import { useCallback, useMemo, useState } from 'react';
import { View } from 'react-native';
import { Tabs } from 'react-native-collapsible-tab-view';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';

import { FollowersTabBar, FollowersTabName } from '~/components/ProfileView/FollowersTabBar';
import { useListContentStyle } from '~/components/ProfileView/Tabs/useListContentStyle';
import { UserFollowCard } from '~/components/UserFollowList/UserFollowCard';
import { ProfileViewFollowersTabQueryFragment$key } from '~/generated/ProfileViewFollowersTabQueryFragment.graphql';
import { UserFollowCardFragment$key } from '~/generated/UserFollowCardFragment.graphql';
import { UserFollowCardQueryFragment$key } from '~/generated/UserFollowCardQueryFragment.graphql';
import { MainTabStackNavigatorProp } from '~/navigation/types';
import { removeNullValues } from '~/shared/relay/removeNullValues';

type ListItem =
  | {
      kind: 'tab-bar';
      selectedTab: FollowersTabName;
    }
  | { kind: 'user'; user: UserFollowCardFragment$key; query: UserFollowCardQueryFragment$key };

type ProfileViewFollowersTabProps = {
  queryRef: ProfileViewFollowersTabQueryFragment$key;
};

export function ProfileViewFollowersTab({ queryRef }: ProfileViewFollowersTabProps) {
  const query = useFragment(
    graphql`
      fragment ProfileViewFollowersTabQueryFragment on Query {
        userByUsername(username: $username) {
          ... on GalleryUser {
            following {
              ...UserFollowCardFragment
            }

            followers {
              ...UserFollowCardFragment
            }
          }
        }

        ...UserFollowCardQueryFragment
      }
    `,
    queryRef
  );

  const user = query.userByUsername;

  const [selectedTab, setSelectedTab] = useState<FollowersTabName>('Following');

  const items = useMemo((): ListItem[] => {
    const items: ListItem[] = [];

    items.push({ kind: 'tab-bar', selectedTab });

    const users = removeNullValues(selectedTab === 'Following' ? user?.following : user?.followers);

    items.push(
      ...users.map((user): ListItem => {
        return {
          kind: 'user',
          user,
          query,
        };
      })
    );

    return items;
  }, [query, selectedTab, user?.followers, user?.following]);

  const navigation = useNavigation<MainTabStackNavigatorProp>();
  const handleUserPress = useCallback(
    (username: string) => {
      navigation.push('Profile', { username, hideBackButton: false });
    },
    [navigation]
  );

  const renderItem = useCallback<ListRenderItem<ListItem>>(
    ({ item }) => {
      if (item.kind === 'user') {
        return (
          <UserFollowCard userRef={item.user} queryRef={item.query} onPress={handleUserPress} />
        );
      } else if (item.kind === 'tab-bar') {
        return <FollowersTabBar activeRoute={item.selectedTab} onRouteChange={setSelectedTab} />;
      }

      return null;
    },
    [handleUserPress]
  );

  const contentContainerStyle = useListContentStyle();

  return (
    <View style={contentContainerStyle}>
      <Tabs.FlashList data={items} estimatedItemSize={40} renderItem={renderItem} />
    </View>
  );
}
