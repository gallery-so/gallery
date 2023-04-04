import { TouchableOpacity, View } from 'react-native';

import { Typography } from '../Typography';

type Props = {
  title: string;
  children: React.ReactNode;
  onShowAll: () => void;
};

export function SearchSection({ children, title, onShowAll }: Props) {
  return (
    <View>
      <View>
        <View className="flex flex-row items-center justify-between">
          <Typography
            font={{
              family: 'ABCDiatype',
              weight: 'Medium',
            }}
            className=" text-metal text-xs uppercase"
          >
            {title}
          </Typography>

          <TouchableOpacity onPress={onShowAll}>
            <Typography
              font={{ family: 'ABCDiatype', weight: 'Regular' }}
              className="border-b border-black"
            >
              Show all
            </Typography>
          </TouchableOpacity>
        </View>

        <View className="flex flex-col">{children}</View>
      </View>
    </View>
  );
}
