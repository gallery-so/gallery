import { ScrollView } from 'react-native';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';

import { GallerySkeleton } from '../GallerySkeleton';
import { LoadingFollowerItem } from './LoadingFollowerItem';

export function LoadingFollowerList() {
  return (
    <ScrollView className="flex w-full flex-col space-y-4 p-3">
      <GallerySkeleton>
        <SkeletonPlaceholder.Item flexDirection="column" paddingHorizontal={0} gap={8} padding={16}>
          <SkeletonPlaceholder.Item width={24} height={24} marginBottom={16} />
          <SkeletonPlaceholder.Item width="100%" height={20} />
          <SkeletonPlaceholder.Item width="30%" height={20} />
        </SkeletonPlaceholder.Item>
      </GallerySkeleton>

      <LoadingFollowerItem />
      <LoadingFollowerItem />
      <LoadingFollowerItem />
      <LoadingFollowerItem />
      <LoadingFollowerItem />
      <LoadingFollowerItem />
      <LoadingFollowerItem />
      <LoadingFollowerItem />
      <LoadingFollowerItem />
      <LoadingFollowerItem />
    </ScrollView>
  );
}
