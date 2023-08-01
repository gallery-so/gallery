import { useNavigation } from '@react-navigation/native';
import { ResizeMode } from 'expo-av';
import { useCallback, useRef } from 'react';
import { useWindowDimensions, View } from 'react-native';
import FastImage from 'react-native-fast-image';
import { graphql, useFragment } from 'react-relay';
import { useTogglePostAdmire } from 'src/hooks/useTogglePostAdmire';

import { UniversalNftPreview } from '~/components/NftPreview/UniversalNftPreview';
import { PostListItemFragment$key } from '~/generated/PostListItemFragment.graphql';
import { PostListItemQueryFragment$key } from '~/generated/PostListItemQueryFragment.graphql';
import { MainTabStackNavigatorProp } from '~/navigation/types';
import getVideoOrImageUrlForNftPreview from '~/shared/relay/getVideoOrImageUrlForNftPreview';

import { DOUBLE_TAP_WINDOW } from '../constants';

type Props = {
  feedPostRef: PostListItemFragment$key;
  queryRef: PostListItemQueryFragment$key;
};

export function PostListItem({ feedPostRef, queryRef }: Props) {
  const feedPost = useFragment(
    graphql`
      fragment PostListItemFragment on Post {
        __typename

        tokens {
          dbid
          ...getVideoOrImageUrlForNftPreviewFragment
          ...UniversalNftPreviewTokenFragment
        }
        ...useTogglePostAdmireFragment
      }
    `,
    feedPostRef
  );

  const query = useFragment(
    graphql`
      fragment PostListItemQueryFragment on Query {
        ...useTogglePostAdmireQueryFragment
      }
    `,
    queryRef
  );

  const navigation = useNavigation<MainTabStackNavigatorProp>();
  const dimensions = useWindowDimensions();
  const singleTapTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { toggleAdmire } = useTogglePostAdmire({
    postRef: feedPost,
    queryRef: query,
  });

  const firstToken = feedPost.tokens?.[0] || null;

  if (!firstToken) {
    throw new Error('There is no token in post');
  }

  const media = getVideoOrImageUrlForNftPreview({
    tokenRef: firstToken,
    preferStillFrameFromGif: true,
  });
  const tokenUrl = media?.urls.large;

  const handlePress = useCallback(() => {
    // ChatGPT says 200ms is at the fast end for double tapping.
    // I want the single tap flow to feel fast, so I'm going for speed here.
    // Our users better be nimble af.

    if (singleTapTimeoutRef.current) {
      clearTimeout(singleTapTimeoutRef.current);
      singleTapTimeoutRef.current = null;

      toggleAdmire();
    } else {
      singleTapTimeoutRef.current = setTimeout(() => {
        singleTapTimeoutRef.current = null;
        navigation.navigate('UniversalNftDetail', {
          cachedPreviewAssetUrl: tokenUrl ?? '',
          tokenId: firstToken.dbid,
        });
      }, DOUBLE_TAP_WINDOW);
    }
  }, [firstToken.dbid, navigation, tokenUrl, toggleAdmire]);

  return (
    <View className="flex flex-1 flex-col pt-1" style={{ width: dimensions.width }}>
      <View
        style={{
          minHeight: dimensions.width,
          minWidth: dimensions.width,
        }}
      >
        <UniversalNftPreview
          onPress={handlePress}
          resizeMode={ResizeMode.CONTAIN}
          priority={FastImage.priority.high}
          tokenRef={firstToken}
          tokenUrl={tokenUrl}
        />
      </View>
    </View>
  );
}
