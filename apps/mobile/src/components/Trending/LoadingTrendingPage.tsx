import { ScrollView } from 'react-native';

import { LoadingTrendingItem } from './LoadingTrendingItem';

export function LoadingTrendingPage() {
  return (
    <ScrollView className="flex w-full flex-col space-y-4 p-3">
      <LoadingTrendingItem />
      <LoadingTrendingItem />
      <LoadingTrendingItem />
      <LoadingTrendingItem />
    </ScrollView>
  );
}
