import { View } from 'react-native';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';

import { GallerySkeleton } from '../GallerySkeleton';

export function SearchResultsFallback() {
  return (
    <View className="flex flex-col space-y-1">
      <SearchTitleFallback />
      <SearchResultFallback />
      <SearchResultFallback />
      <SearchResultFallback />
      <SearchResultFallback />

      <SearchTitleFallback />
      <SearchResultFallback />
      <SearchResultFallback />
      <SearchResultFallback />
      <SearchResultFallback />
    </View>
  );
}

function SearchResultFallback() {
  return (
    <View className="px-4 py-3">
      <GallerySkeleton>
        <SkeletonPlaceholder.Item alignItems="center" flexDirection="row" gap={4}>
          <SkeletonPlaceholder.Item width={24} height={24} borderRadius={80} />
          <SkeletonPlaceholder.Item flexDirection="column" rowGap={4}>
            <SkeletonPlaceholder.Item width={50} height={12} />
            <SkeletonPlaceholder.Item width={100} height={10} />
          </SkeletonPlaceholder.Item>
        </SkeletonPlaceholder.Item>
      </GallerySkeleton>
    </View>
  );
}

function SearchTitleFallback() {
  return (
    <View className="px-4 py-3">
      <GallerySkeleton>
        <SkeletonPlaceholder.Item width={100} height={10} />
      </GallerySkeleton>
    </View>
  );
}
