import { useNavigation } from '@react-navigation/native';
import { useCallback } from 'react';
import { Text, View } from 'react-native';

import { FeedTabNavigatorProp } from '~/navigation/types';

import { Button } from '../Button';
import { Typography } from '../Typography';

export function EmptyFeed() {
  const navigation = useNavigation<FeedTabNavigatorProp>();

  const handleNavigation = useCallback(() => {
    navigation.navigate('Explore');
  }, [navigation]);

  return (
    <View className="flex-1 justify-center items-center ">
      <View className="max-w-[210px] items-center">
        <Typography
          font={{
            family: 'ABCDiatype',
            weight: 'Bold',
          }}
          className="text-lg"
        >
          Nothing here yet
        </Typography>
        <Text className="mb-3">
          Start following people and you’ll see their gallery updates here.
        </Text>
        <Button onPress={handleNavigation} text="Explore" size="sm" />
      </View>
    </View>
  );
}
