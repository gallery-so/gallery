import { useNavigation } from '@react-navigation/native';
import { useCallback } from 'react';
import { Text } from 'react-native';

import { GalleryTextElementParserMentionsFragment$data } from '~/generated/GalleryTextElementParserMentionsFragment.graphql';
import { MainTabStackNavigatorProp } from '~/navigation/types';

type Props = {
  mention: string;
  mentionData: GalleryTextElementParserMentionsFragment$data['entity'];
};

export function MentionComponent({ mention, mentionData }: Props) {
  const navigation = useNavigation<MainTabStackNavigatorProp>();

  const onMentionPress = useCallback(() => {
    if (!mentionData) return;

    if (mentionData.__typename === 'GalleryUser') {
      navigation.navigate('Profile', {
        username: mentionData.username ?? '',
      });
      return;
    }
    if (mentionData.__typename === 'Community') {
      navigation.navigate('Community', {
        contractAddress: mentionData.contractAddress?.address ?? '',
        chain: mentionData.contractAddress?.chain ?? '',
      });
    }
  }, [mentionData, navigation]);

  return (
    <Text className="text-shadow" onPress={onMentionPress}>
      {mention}
    </Text>
  );
}
