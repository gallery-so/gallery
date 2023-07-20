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
import { PostScreenQuery } from '~/generated/PostScreenQuery.graphql';
import { PostScreenTokenFragment$key } from '~/generated/PostScreenTokenFragment.graphql';
import { FeedTabNavigatorProp, PostStackNavigatorParamList } from '~/navigation/types';

import { usePost } from './usePost';

export function PostScreen() {
  const route = useRoute<RouteProp<PostStackNavigatorParamList, 'PostComposer'>>();
  const query = useLazyLoadQuery<PostScreenQuery>(
    graphql`
      query PostScreenQuery($tokenId: DBID!) {
        tokenById(id: $tokenId) {
          ... on Token {
            __typename
            tokenId
            ...PostScreenTokenFragment
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
  const { post } = usePost();

  const [caption, setCaption] = useState('');

  const bottomSheetRef = useRef<GalleryBottomSheetModalType | null>(null);
  const handleBackPress = useCallback(() => {
    Keyboard.dismiss();

    bottomSheetRef.current?.present();
  }, []);

  const navigation = useNavigation<FeedTabNavigatorProp>();
  const { pushToast } = useToastActions();
  const handlePost = useCallback(async () => {
    const tokenId = token.tokenId;

    if (!tokenId) {
      return;
    }

    await post({
      tokenId,
      caption,
    });

    navigation.pop(1);
    navigation.navigate('Trending');

    pushToast({
      children: <ToastMessage tokenRef={token} />,
    });
  }, [caption, navigation, post, pushToast, token]);

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
          <PostInput value={caption} onChange={setCaption} />

          <View className="py-4">
            <PostTokenPreview bottomSheetRef={bottomSheetRef} />
          </View>
        </View>
      </View>

      <WarningPostBottomSheet ref={bottomSheetRef} />
    </View>
  );
}

type ToastMessageProps = {
  tokenRef: PostScreenTokenFragment$key;
};
export function ToastMessage({ tokenRef }: ToastMessageProps) {
  const token = useFragment(
    graphql`
      fragment PostScreenTokenFragment on Token {
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
