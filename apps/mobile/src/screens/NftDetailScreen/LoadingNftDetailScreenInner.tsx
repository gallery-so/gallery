import { useNavigation } from '@react-navigation/native';
import { View } from 'react-native';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import { BackIcon } from 'src/icons/BackIcon';

import { GallerySkeleton } from '~/components/GallerySkeleton';
import { IconContainer } from '~/components/IconContainer';

export function LoadingNftDetailScreenInner() {
  const navigation = useNavigation();
  return (
    <View className="flex flex-col space-y-3 px-4">
      <View className="flex flex-row justify-between">
        <IconContainer icon={<BackIcon />} onPress={navigation.goBack} />
      </View>
      <View>
        <GallerySkeleton>
          <SkeletonPlaceholder.Item flexDirection="column" gap={16}>
            <SkeletonPlaceholder.Item width="100%" aspectRatio="1" />
            <SkeletonPlaceholder.Item flexDirection="column" gap={8} height="100%">
              <SkeletonPlaceholder.Item width="60%" height={36} />
              <SkeletonPlaceholder.Item width="80%" height={20} />
              <SkeletonPlaceholder.Item width="80%" height={20} />
              <SkeletonPlaceholder.Item width="80%" height={20} />
            </SkeletonPlaceholder.Item>
          </SkeletonPlaceholder.Item>
        </GallerySkeleton>
      </View>
    </View>
  );
}
