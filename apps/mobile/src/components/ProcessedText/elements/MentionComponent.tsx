import { useNavigation } from '@react-navigation/native';
import { useCallback } from 'react';
import { Text } from 'react-native';
import { graphql, useFragment } from 'react-relay';

import { MentionComponentFragment$key } from '~/generated/MentionComponentFragment.graphql';
import { MainTabStackNavigatorProp } from '~/navigation/types';

type Props = {
  mention: string;
  mentionRef: MentionComponentFragment$key;
};

export function MentionComponent({ mention, mentionRef }: Props) {
  const mentionData = useFragment(
    graphql`
      fragment MentionComponentFragment on Mention {
        __typename
        entity {
          __typename
          ... on GalleryUser {
            __typename
            username
          }
          ... on Community {
            __typename
            contractAddress {
              __typename
              address
              chain
            }
          }
        }
      }
    `,
    mentionRef
  );

  const navigation = useNavigation<MainTabStackNavigatorProp>();

  const onMentionPress = useCallback(() => {
    if (mentionData.entity?.__typename === 'GalleryUser') {
      navigation.navigate('Profile', {
        username: mentionData.entity.username ?? '',
      });
      return;
    }

    if (mentionData.entity?.__typename === 'Community') {
      navigation.navigate('Community', {
        contractAddress: mentionData.entity.contractAddress?.address ?? '',
        chain: mentionData.entity.contractAddress?.chain ?? '',
      });
    }
  }, [mentionData, navigation]);

  return (
    <Text className="text-shadow" onPress={onMentionPress}>
      {mention}
    </Text>
  );
}
