import { View } from 'react-native';

import { Typography } from '../Typography';

type CollectionAndAdditionCountProps = {
  collectionName?: string | null;
  additionCount?: number | null;
};

export function CollectionAndAdditionCount({
  collectionName,
  additionCount,
}: CollectionAndAdditionCountProps) {
  if (!collectionName && !additionCount) {
    return null;
  }

  return (
    <View className="flex px-3 py-2">
      {collectionName && (
        <Typography className="text-xs" font={{ family: 'ABCDiatype', weight: 'Bold' }}>
          {collectionName || 'Untitled'}
        </Typography>
      )}

      {additionCount ? (
        <Typography font={{ family: 'ABCDiatype', weight: 'Regular' }} className="text-xs">
          {additionCount} addition{additionCount === 1 ? '' : 's'}
        </Typography>
      ) : null}
    </View>
  );
}
