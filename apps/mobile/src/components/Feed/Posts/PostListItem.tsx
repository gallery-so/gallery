import { ResizeMode } from 'expo-av';
import { useWindowDimensions, View } from 'react-native';
import FastImage from 'react-native-fast-image';
import { graphql, useFragment } from 'react-relay';

import { UniversalNftPreview } from '~/components/NftPreview/UniversalNftPreview';
import { PostListItemFragment$key } from '~/generated/PostListItemFragment.graphql';
import getVideoOrImageUrlForNftPreview from '~/shared/relay/getVideoOrImageUrlForNftPreview';

type Props = {
  feedPostRef: PostListItemFragment$key;
};

export function PostListItem({ feedPostRef }: Props) {
  const feedPost = useFragment(
    graphql`
      fragment PostListItemFragment on Post {
        __typename

        tokens {
          ...getVideoOrImageUrlForNftPreviewFragment
          ...UniversalNftPreviewTokenFragment
        }
      }
    `,
    feedPostRef
  );

  const dimensions = useWindowDimensions();

  const firstToken = feedPost.tokens?.[0] || null;

  if (!firstToken) {
    throw new Error('There is no token in post');
  }

  const media = getVideoOrImageUrlForNftPreview({
    tokenRef: firstToken,
    preferStillFrameFromGif: true,
  });

  if (!media) {
    return null;
  }

  const tokenUrl = media.urls.large;

  return (
    <View className="flex flex-1 flex-col pt-1" style={{ width: dimensions.width }}>
      <View
        style={{
          minHeight: dimensions.width,
          minWidth: dimensions.width,
        }}
      >
        <UniversalNftPreview
          onPress={() => {}}
          resizeMode={ResizeMode.CONTAIN}
          priority={FastImage.priority.high}
          tokenRef={firstToken}
          tokenUrl={tokenUrl}
        />
      </View>
    </View>
  );
}
