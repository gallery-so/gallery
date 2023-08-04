import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { useCallback, useRef, useState } from 'react';
import { Keyboard, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { graphql, useFragment, useLazyLoadQuery } from 'react-relay';

import { BackButton } from '~/components/BackButton';
import { GalleryBottomSheetModalType } from '~/components/GalleryBottomSheet/GalleryBottomSheetModal';
import { GalleryTouchableOpacity } from '~/components/GalleryTouchableOpacity';
import { PostInput } from '~/components/Post/PostInput';
import { PostTokenPreview } from '~/components/Post/PostTokenPreview';
import { WarningPostBottomSheet } from '~/components/Post/WarningPostBottomSheet';
import { Typography } from '~/components/Typography';
import { useToastActions } from '~/contexts/ToastContext';
import { PostComposerScreenQuery } from '~/generated/PostComposerScreenQuery.graphql';
import { PostComposerScreenTokenFragment$key } from '~/generated/PostComposerScreenTokenFragment.graphql';
import {
  FeedTabNavigatorProp,
  MainTabStackNavigatorProp,
  PostStackNavigatorParamList,
} from '~/navigation/types';

import { usePost } from './usePost';

export function PostComposerScreen() {
  const route = useRoute<RouteProp<PostStackNavigatorParamList, 'PostComposer'>>();
  const query = useLazyLoadQuery<PostComposerScreenQuery>(
    graphql`
      query PostComposerScreenQuery($tokenId: DBID!) {
        tokenById(id: $tokenId) {
          ... on Token {
            __typename
            dbid
            chain
            contract {
              contractAddress {
                address
              }
            }
            ...PostComposerScreenTokenFragment
            ...PostInputTokenFragment
            ...usePostTokenFragment
          }
        }
      }
    `,
    {
      tokenId: route.params.tokenId,
    }
  );

  const token = query.tokenById;

  if (token?.__typename !== 'Token') {
    throw new Error("We couldn't find that token. Something went wrong and we're looking into it.");
  }

  const { top } = useSafeAreaInsets();
  const { post } = usePost({
    tokenRef: token,
  });

  const [caption, setCaption] = useState('');

  const bottomSheetRef = useRef<GalleryBottomSheetModalType | null>(null);
  const handleBackPress = useCallback(() => {
    Keyboard.dismiss();

    bottomSheetRef.current?.present();
  }, []);

  const mainTabNavigation = useNavigation<MainTabStackNavigatorProp>();
  const feedTabNavigation = useNavigation<FeedTabNavigatorProp>();

  const { pushToast } = useToastActions();
  const handlePost = useCallback(async () => {
    const tokenId = token.dbid;

    if (!tokenId) {
      return;
    }

    await post({
      tokenId,
      caption,
    });

    mainTabNavigation.reset({
      index: 0,
      routes: [
        {
          name: 'MainTabs',
          params: { screen: 'HomeTab', params: { screen: 'Home', params: { screen: 'Latest' } } },
        },
      ],
    });

    if (route.params.redirectTo === 'Community') {
      mainTabNavigation.navigate('Community', {
        contractAddress: token.contract?.contractAddress?.address ?? '',
        chain: token.chain ?? '',
      });
    } else {
      feedTabNavigation.navigate('Latest');
    }

    pushToast({
      children: <ToastMessage tokenRef={token} />,
    });
  }, [
    caption,
    feedTabNavigation,
    mainTabNavigation,
    post,
    pushToast,
    route.params.redirectTo,
    token,
  ]);

  return (
    <View className="flex-1 bg-white dark:bg-black-900" style={{ paddingTop: top }}>
      <View className="flex flex-col flex-grow space-y-8">
        <View className="px-4 relative flex-row items-center justify-between">
          <BackButton onPress={handleBackPress} />

          <View className="flex flex-row justify-center items-center" pointerEvents="none">
            <Typography className="text-sm" font={{ family: 'ABCDiatype', weight: 'Bold' }}>
              New post
            </Typography>
          </View>

          <GalleryTouchableOpacity
            onPress={handlePost}
            eventElementId="Post Button"
            eventName="Post button clicked"
          >
            <Typography
              className="text-sm text-activeBlue"
              font={{
                family: 'ABCDiatype',
                weight: 'Bold',
              }}
            >
              POST
            </Typography>
          </GalleryTouchableOpacity>
        </View>

        <View className="px-4 flex flex-col flex-grow space-y-2">
          <PostInput value={caption} onChange={setCaption} tokenRef={token} />

          <View className="py-4">
            <PostTokenPreview />
          </View>
        </View>
      </View>

      <WarningPostBottomSheet ref={bottomSheetRef} />
    </View>
  );
}

type ToastMessageProps = {
  tokenRef: PostComposerScreenTokenFragment$key;
};
export function ToastMessage({ tokenRef }: ToastMessageProps) {
  const token = useFragment(
    graphql`
      fragment PostComposerScreenTokenFragment on Token {
        name
      }
    `,
    tokenRef
  );

  return (
    <View className="flex flex-row items-center gap-1">
      <Typography
        className="text-sm text-offBlack dark:text-offWhite"
        font={{ family: 'ABCDiatype', weight: 'Regular' }}
      >
        Successfully posted
      </Typography>
      <Typography
        className="text-sm text-offBlack dark:text-offWhite"
        font={{ family: 'ABCDiatype', weight: 'Bold' }}
      >
        {token.name}
      </Typography>
    </View>
  );
}
