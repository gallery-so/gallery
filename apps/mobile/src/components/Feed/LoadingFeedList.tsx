import { ScrollView } from 'react-native';

import { LoadingFeedListItem } from './LoadingFeedListItem';

export function LoadingFeedList() {
  return (
    <ScrollView className="flex w-full flex-col space-y-8">
      <LoadingFeedListItem />
      <LoadingFeedListItem />
      <LoadingFeedListItem />
      <LoadingFeedListItem />
      <LoadingFeedListItem />
    </ScrollView>
  );
}
