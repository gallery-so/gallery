import { useNavigation } from '@react-navigation/native';
import { ResizeMode } from 'expo-av';
import { useCallback, useRef } from 'react';
import { useWindowDimensions, View } from 'react-native';
import FastImage from 'react-native-fast-image';
import { graphql, useFragment } from 'react-relay';
import { useTogglePostAdmire } from 'src/hooks/useTogglePostAdmire';

import { GalleryTouchableOpacity } from '~/components/GalleryTouchableOpacity';
import { UniversalNftPreviewWithBoundary } from '~/components/NftPreview/UniversalNftPreview';
import { Pill } from '~/components/Pill';
import { Typography } from '~/components/Typography';
import { PostListItemFragment$key } from '~/generated/PostListItemFragment.graphql';
import { PostListItemQueryFragment$key } from '~/generated/PostListItemQueryFragment.graphql';
import { MainTabStackNavigatorProp } from '~/navigation/types';
import { useGetSinglePreviewImage } from '~/shared/relay/useGetPreviewImages';

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
          community {
            name
            contractAddress {
              address
              chain
            }
          }
          ...useGetPreviewImagesSingleFragment
          ...UniversalNftPreviewFragment
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
  const community = firstToken?.community ?? null;

  const handleCommunityPress = useCallback(() => {
    if (community?.contractAddress?.address && community?.contractAddress?.chain) {
      navigation.push('Community', {
        contractAddress: community.contractAddress?.address ?? '',
        chain: community.contractAddress?.chain ?? '',
      });
    }

    return;
  }, [community, navigation]);

  if (!firstToken) {
    throw new Error('There is no token in post');
  }

  const imageUrl = useGetSinglePreviewImage({
    tokenRef: firstToken,
    preferStillFrameFromGif: true,
    size: 'large',
    // we're simply using the URL for warming the cache;
    // no need to throw an error if image is invalid
    shouldThrow: false,
  });

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
          cachedPreviewAssetUrl: imageUrl ?? '',
          tokenId: firstToken.dbid,
        });
      }, DOUBLE_TAP_WINDOW);
    }
  }, [firstToken.dbid, navigation, imageUrl, toggleAdmire]);

  return (
    <View className="flex flex-1 flex-col pt-1" style={{ width: dimensions.width }}>
      <View
        style={{
          height: dimensions.width,
          width: dimensions.width,
        }}
      >
        <UniversalNftPreviewWithBoundary
          tokenRef={firstToken}
          onPress={handlePress}
          resizeMode={ResizeMode.CONTAIN}
          priority={FastImage.priority.high}
          size="large"
        />
      </View>
      {community && (
        <GalleryTouchableOpacity
          className="flex flex-row mt-3 ml-3"
          onPress={handleCommunityPress}
          eventElementId="Post Community Pill"
          eventName="Clicked Post Community Pill"
          properties={{ communityName: community.name }}
        >
          <Pill className="dark:border-black-500">
            <Typography
              numberOfLines={1}
              className="text-sm "
              font={{ family: 'ABCDiatype', weight: 'Bold' }}
            >
              {community.name || 'Unknown Collection'}
            </Typography>
          </Pill>
        </GalleryTouchableOpacity>
      )}
    </View>
  );
}
