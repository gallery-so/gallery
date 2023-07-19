import { Text, View } from 'react-native';
import { graphql, useFragment } from 'react-relay';

import { PostListCaptionFragment$key } from '~/generated/PostListCaptionFragment.graphql';

type Props = {
  feedPostRef: PostListCaptionFragment$key;
};

export function PostListCaption({ feedPostRef }: Props) {
  const feedPost = useFragment(
    graphql`
      fragment PostListCaptionFragment on Post {
        __typename
        caption
      }
    `,
    feedPostRef
  );

  const { caption } = feedPost;

  return (
    <View className="px-4 pb-4">
      <Text className="text-sm">{caption}</Text>
    </View>
  );
}
