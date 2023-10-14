import { useNavigation } from '@react-navigation/native';
import { useCallback } from 'react';
import { Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FeedTabNavigatorProp } from '~/navigation/types';
import { contexts } from '~/shared/analytics/constants';

import { Button } from '../Button';
import { Typography } from '../Typography';
import { ActiveFeed, FeedFilter } from './FeedFilter';

type Props = {
  onChangeFeedMode: (feedMode: ActiveFeed) => void;
};

export function EmptyFeed({ onChangeFeedMode }: Props) {
  const { bottom } = useSafeAreaInsets();
  const navigation = useNavigation<FeedTabNavigatorProp>();

  const handleNavigation = useCallback(() => {
    navigation.navigate('Explore');
  }, [navigation]);

  return (
    <View
      className="flex-1 items-center"
      style={{
        marginBottom: bottom,
      }}
    >
      <FeedFilter activeFeed={'Following'} onChange={onChangeFeedMode} />
      <View className="max-w-[210px] flex-1 justify-center items-center">
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
        <Button
          eventElementId="Empty Feed Explore Button"
          eventName="Empty Feed Explore Button Clicked"
          eventContext={contexts.Feed}
          onPress={handleNavigation}
          text="Explore"
          size="sm"
        />
      </View>
    </View>
  );
}
