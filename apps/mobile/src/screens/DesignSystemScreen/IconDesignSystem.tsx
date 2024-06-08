import React from 'react';
import { View } from 'react-native';
import * as Icons from 'src/icons';

import { Typography } from '~/components/Typography';

type IconNames = keyof typeof Icons;

const IconDesignSystem = () => {
  function getIcon(iconName: IconNames) {
    return Icons[iconName]({
      width: 24,
      height: 24,
    });
  }

  return (
    <View>
      <View className="flex-row flex-wrap">
        {Object.keys(Icons).map((iconName) => {
          return (
            <View key={iconName} className="w-1/3  flex gap-2 items-center py-4">
              <View className="bg-offWhite h-10 w-10 items-center justify-center rounded-full">
                {getIcon(iconName as IconNames)}
              </View>
              <Typography font={{ family: 'ABCDiatype', weight: 'Regular' }} className="text-sm">
                {iconName.replace('Icon', '')}
              </Typography>
            </View>
          );
        })}
      </View>
    </View>
  );
};

export default IconDesignSystem;
