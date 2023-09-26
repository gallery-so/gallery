import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { Suspense, useCallback, useRef, useState } from 'react';
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

import { PostComposerNftFallback } from './PostComposerNftFallback';
import { usePost } from './usePost';

function PostComposerScreenInner() {
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

  const { post } = usePost({
    tokenRef: token,
  });

  const [caption, setCaption] = useState('');
  const [isPosting, setIsPosting] = useState(false);

  const mainTabNavigation = useNavigation<MainTabStackNavigatorProp>();
  const feedTabNavigation = useNavigation<FeedTabNavigatorProp>();
  const navigation = useNavigation();

  const bottomSheetRef = useRef<GalleryBottomSheetModalType | null>(null);
  const handleBackPress = useCallback(() => {
    if (!caption) {
      navigation.goBack();
      return;
    }
    Keyboard.dismiss();

    bottomSheetRef.current?.present();
  }, [caption, navigation]);

  const { pushToast } = useToastActions();

  const handlePost = useCallback(async () => {
    const tokenId = token.dbid;

    if (!tokenId || isPosting) {
      return;
    }

    setIsPosting(true);

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

    setIsPosting(false);
    pushToast({
      children: <ToastMessage tokenRef={token} />,
    });
  }, [
    caption,
    feedTabNavigation,
    isPosting,
    mainTabNavigation,
    post,
    pushToast,
    route.params.redirectTo,
    token,
  ]);

  return (
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
          disabled={isPosting}
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
          <Suspense fallback={<PostComposerNftFallback />}>
            <PostTokenPreview />
          </Suspense>
        </View>
      </View>
      <WarningPostBottomSheet ref={bottomSheetRef} />
    </View>
  );
}

export function PostComposerScreen() {
  const { top } = useSafeAreaInsets();

  return (
    <GalleryTouchableOpacity
      withoutFeedback
      onPress={Keyboard.dismiss}
      accessible={false}
      eventElementId={null}
      eventName={null}
    >
      <View className="flex-1 bg-offWhite dark:bg-black-900" style={{ paddingTop: top }}>
        <Suspense fallback={null}>
          <PostComposerScreenInner />
        </Suspense>
      </View>
    </GalleryTouchableOpacity>
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
