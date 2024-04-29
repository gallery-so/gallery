import { View } from 'react-native';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';

import { GallerySkeleton } from '../GallerySkeleton';

export function SearchDefaultFallback() {
  return (
    <View className="flex flex-col space-y-1">
      <SearchDefaultCardRowFallback />
      <SearchDefaultCardRowFallback />
      <SearchDefaultUserListFallback />
    </View>
  );
}

export function SearchDefaultCardRowFallback() {
  return (
    <View className="px-4 py-3">
      <GallerySkeleton>
        <SkeletonPlaceholder.Item
          alignItems="center"
          flexDirection="row"
          justifyContent="center"
          gap={8}
        >
          <SkeletonPlaceholder.Item width={185} height={145} />
          <SkeletonPlaceholder.Item width={185} height={145} />
        </SkeletonPlaceholder.Item>
      </GallerySkeleton>
    </View>
  );
}

export function SearchDefaultUserListFallback() {
  return (
    <View className="px-4 py-3">
      <GallerySkeleton>
        <SkeletonPlaceholder.Item alignItems="center" flexDirection="column" gap={8}>
          <SkeletonPlaceholder.Item flexDirection="column" rowGap={4}>
            <SkeletonPlaceholder.Item width={430} height={40} />
            <SkeletonPlaceholder.Item width={430} height={40} />
            <SkeletonPlaceholder.Item width={430} height={40} />
            <SkeletonPlaceholder.Item width={430} height={40} />
            <SkeletonPlaceholder.Item width={430} height={40} />
          </SkeletonPlaceholder.Item>
        </SkeletonPlaceholder.Item>
      </GallerySkeleton>
    </View>
  );
}
