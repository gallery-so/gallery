import { Text, View } from 'react-native';

import { useListContentStyle } from '../ProfileView/Tabs/useListContentStyle';

export function CommunityPosts() {
  const contentContainerStyle = useListContentStyle();

  return (
    <View style={contentContainerStyle}>
      <Text>CommunityPosts</Text>
    </View>
  );
}
