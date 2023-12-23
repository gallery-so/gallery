import { useNavigation } from '@react-navigation/native';
import { useCallback } from 'react';
import { Text } from 'react-native';

import { GalleryTextElementParserMentionsFragment$data } from '~/generated/GalleryTextElementParserMentionsFragment.graphql';
import { MainTabStackNavigatorProp } from '~/navigation/types';

type Props = {
  mention: string;
  mentionData: GalleryTextElementParserMentionsFragment$data['entity'] | null;
};

export function MentionComponent({ mention, mentionData }: Props) {
  const navigation = useNavigation<MainTabStackNavigatorProp>();

  const onMentionPress = useCallback(() => {
    if (!mentionData) return;

    if (mentionData.__typename === 'GalleryUser') {
      navigation.push('Profile', {
        username: mentionData.username ?? '',
      });
      return;
    }
    if (mentionData.__typename === 'Community') {
      if (!mentionData.subtype || mentionData.subtype?.__typename === '%other') {
        return;
      }

      navigation.navigate('Community', {
        subtype: mentionData.subtype.__typename,
        contractAddress: mentionData.subtype.communityKey?.contract?.address ?? '',
        chain: mentionData.subtype.communityKey?.contract?.chain ?? 'Ethereum',
        projectId:
          mentionData.subtype?.__typename === 'ArtBlocksCommunity'
            ? mentionData.subtype.projectID ?? ''
            : '',
      });
    }
  }, [mentionData, navigation]);

  return (
    <Text className="text-shadow" onPress={onMentionPress}>
      {mention}
    </Text>
  );
}
