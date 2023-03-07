import { Text, View } from 'react-native';

import { Typography } from '../Typography';

type CollectionAndAdditionCountProps = {
  collectionName: string | undefined | null;
  additionCount: number | undefined | null;
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
        <Typography className="text-sm" font={{ family: 'ABCDiatype', weight: 'Bold' }}>
          {collectionName}
        </Typography>
      )}

      {additionCount && (
        <Typography font={{ fontFamily: 'ABCDiatype', weight: 'Regular' }} className="text-sm">
          {additionCount} addition{additionCount === 1 ? '' : 's'}
        </Typography>
      )}
    </View>
  );
}
