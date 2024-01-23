import clsx from 'clsx';
import { useColorScheme } from 'nativewind';
import { View } from 'react-native';
import { contexts } from 'shared/analytics/constants';
import colors from 'shared/theme/colors';
import { GridIcon } from 'src/icons/GridIcon';
import { ListIcon } from 'src/icons/ListIcon';

import { GalleryTouchableOpacity } from '~/components/GalleryTouchableOpacity';
import { Typography } from '~/components/Typography';

import { CollectorTokenLayout } from '../CommunityCollectors';

type Props = {
  layout: CollectorTokenLayout;
  onLayoutChange: (layout: CollectorTokenLayout) => void;
};

export function CommunityCollectorsHeader({ layout, onLayoutChange }: Props) {
  const { colorScheme } = useColorScheme();

  return (
    <View className="p-4 flex-row items-center justify-between">
      <Typography font={{ family: 'ABCDiatype', weight: 'Bold' }} className="text-sm">
        Collectors on Gallery
      </Typography>

      <View className="flex-row border border-faint dark:border-shadow">
        <GalleryTouchableOpacity
          className={clsx(
            'p-1',
            layout === 'grid' ? 'bg-white dark:bg-black-900' : 'bg-faint dark:bg-shadow'
          )}
          eventElementId="Community Grid Layout"
          eventName="Press Community Grid Layout"
          eventContext={contexts.Community}
          onPress={() => onLayoutChange('grid')}
        >
          <GridIcon color={colorScheme === 'dark' ? colors.offWhite : colors.black[800]} />
        </GalleryTouchableOpacity>
        <GalleryTouchableOpacity
          className={clsx(
            'p-1',
            layout === 'list' ? 'bg-white dark:bg-black-900' : 'bg-faint dark:bg-shadow'
          )}
          eventElementId="Community List Layout"
          eventName="Press Community List Layout"
          eventContext={contexts.Community}
          onPress={() => onLayoutChange('list')}
        >
          <ListIcon color={colorScheme === 'dark' ? colors.faint : colors.shadow} />
        </GalleryTouchableOpacity>
      </View>
    </View>
  );
}
