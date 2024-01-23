import { View } from 'react-native';
import { GridIcon } from 'src/icons/GridIcon';
import { ListIcon } from 'src/icons/ListIcon';

import { GalleryTouchableOpacity } from '~/components/GalleryTouchableOpacity';
import { Typography } from '~/components/Typography';

export function CommunityCollectorsHeader() {
  return (
    <View className="p-4 flex-row items-center justify-between">
      <Typography font={{ family: 'ABCDiatype', weight: 'Bold' }} className="text-sm">
        Collectors on Gallery
      </Typography>

      <View className="flex-row border border-faint">
        <GalleryTouchableOpacity
          className="p-1"
          eventElementId={null}
          eventName={null}
          eventContext={null}
        >
          <GridIcon />
        </GalleryTouchableOpacity>
        <GalleryTouchableOpacity
          className="p-1 bg-faint"
          eventElementId={null}
          eventName={null}
          eventContext={null}
        >
          <ListIcon />
        </GalleryTouchableOpacity>
      </View>
    </View>
  );
}
