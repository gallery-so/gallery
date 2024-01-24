import { View } from 'react-native';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';

import { GallerySkeleton } from '~/components/GallerySkeleton';

export function CommunityCollectorsGridFallback() {
  return (
    <View className="flex flex-col">
      <View className="px-4">
        <GallerySkeleton>
          <SkeletonPlaceholder.Item flexDirection="column" width="100%" paddingTop={16}>
            <SkeletonPlaceholder.Item
              alignItems="center"
              flexDirection="row"
              justifyContent="space-between"
              paddingVertical={16}
            >
              <SkeletonPlaceholder.Item width={130} height={16} />
              <SkeletonPlaceholder.Item width={48} height={24} />
            </SkeletonPlaceholder.Item>

            <SkeletonPlaceholder.Item
              flexDirection="row"
              justifyContent="space-between"
              gap={4}
              flexWrap="wrap"
            >
              {Array(6)
                .fill(null)
                .map((_, index) => (
                  <SkeletonPlaceholder.Item key={index} paddingBottom={20}>
                    <SkeletonPlaceholder.Item width={175} height={175} marginBottom={8} />
                    <SkeletonPlaceholder.Item width={60} height={14} marginBottom={4} />

                    <SkeletonPlaceholder.Item flexDirection="row" gap={4}>
                      <SkeletonPlaceholder.Item width={16} height={16} borderRadius={50} />
                      <SkeletonPlaceholder.Item width={50} height={14} />
                    </SkeletonPlaceholder.Item>
                  </SkeletonPlaceholder.Item>
                ))}
            </SkeletonPlaceholder.Item>
          </SkeletonPlaceholder.Item>
        </GallerySkeleton>
      </View>
    </View>
  );
}
