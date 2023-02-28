import { Text, View } from 'react-native';

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
        <Text style={{ fontFamily: 'ABCDiatypeBold', fontSize: 12 }}>{collectionName}</Text>
      )}

      {additionCount && (
        <Text style={{ fontFamily: 'ABCDiatypeRegular', fontSize: 12 }}>
          {additionCount} addition{additionCount === 1 ? '' : 's'}
        </Text>
      )}
    </View>
  );
}
