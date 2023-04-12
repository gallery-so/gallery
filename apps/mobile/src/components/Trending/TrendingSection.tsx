import { TouchableOpacity, View } from 'react-native';

import { Typography } from '../Typography';
// import { TrendingUserCard } from './TrendingUserCard';

type Props = {
  title: string;
  description: string;
};

export function TrendingSection({ title, description }: Props) {
  return (
    <View className="flex-1 px-3">
      <View className="flex flex-row items-end justify-between py-3">
        <View>
          <Typography
            font={{
              family: 'ABCDiatype',
              weight: 'Bold',
            }}
            className="text-lg text-black"
          >
            {title}
          </Typography>
          <Typography
            font={{
              family: 'ABCDiatype',
              weight: 'Bold',
            }}
            className="text-metal text-sm"
          >
            {description}
          </Typography>
        </View>
        <TouchableOpacity onPress={() => {}}>
          <Typography
            font={{
              family: 'ABCDiatype',
              weight: 'Regular',
            }}
            className="text-shadow text-sm underline"
          >
            See all
          </Typography>
        </TouchableOpacity>
      </View>
      <View className="py-3">{/* <TrendingUserCard /> */}</View>
    </View>
  );
}
