import { useBottomSheetDynamicSnapPoints } from '@gorhom/bottom-sheet';
import { useNavigation } from '@react-navigation/native';
import { ForwardedRef, forwardRef, useCallback, useMemo, useRef } from 'react';
import { View } from 'react-native';
import { graphql, useFragment } from 'react-relay';

import { Button } from '~/components/Button';
import {
  GalleryBottomSheetModal,
  GalleryBottomSheetModalType,
} from '~/components/GalleryBottomSheet/GalleryBottomSheetModal';
import { useSafeAreaPadding } from '~/components/SafeAreaViewWithPadding';
import { Typography } from '~/components/Typography';
import { DeletePostBottomSheetFragment$key } from '~/generated/DeletePostBottomSheetFragment.graphql';
import { usePost } from '~/screens/PostScreen/usePost';
import { removeNullValues } from '~/shared/relay/removeNullValues';

const SNAP_POINTS = ['CONTENT_HEIGHT'];

type Props = {
  postRef: DeletePostBottomSheetFragment$key;
  onDeleted: () => void;
};

function DeletePostBottomSheet(
  { postRef, onDeleted }: Props,
  ref: ForwardedRef<GalleryBottomSheetModalType>
) {
  const post = useFragment(
    graphql`
      fragment DeletePostBottomSheetFragment on Post {
        dbid @required(action: THROW)
        tokens {
          ...usePostTokenFragment
        }
      }
    `,
    postRef
  );

  const navigation = useNavigation();

  const token = useMemo(() => {
    const tokens = post?.tokens;

    return removeNullValues(tokens)[0];
  }, [post?.tokens]);

  if (!token) {
    throw new Error(
      "We couldn't find that token in the post. Something went wrong and we're looking into it."
    );
  }

  const { deletePost } = usePost({
    tokenRef: token,
  });
  const { bottom } = useSafeAreaPadding();

  const bottomSheetRef = useRef<GalleryBottomSheetModalType | null>(null);

  const { animatedHandleHeight, animatedSnapPoints, animatedContentHeight, handleContentLayout } =
    useBottomSheetDynamicSnapPoints(SNAP_POINTS);

  const handleBack = useCallback(() => {
    bottomSheetRef.current?.dismiss();
    navigation.goBack();
  }, [navigation]);

  const handleDelete = useCallback(() => {
    deletePost(post.dbid);
    bottomSheetRef.current?.dismiss();
    onDeleted();
  }, [deletePost, onDeleted, post.dbid]);

  return (
    <GalleryBottomSheetModal
      ref={(value) => {
        bottomSheetRef.current = value;

        if (typeof ref === 'function') {
          ref(value);
        } else if (ref) {
          ref.current = value;
        }
      }}
      snapPoints={animatedSnapPoints.value}
      handleHeight={animatedHandleHeight}
      contentHeight={animatedContentHeight}
    >
      <View
        onLayout={handleContentLayout}
        style={{ paddingBottom: bottom }}
        className="p-4 flex flex-col space-y-6"
      >
        <View className="flex flex-col space-y-4">
          <Typography
            className="text-lg text-black-900 dark:text-offWhite"
            font={{ family: 'ABCDiatype', weight: 'Bold' }}
          >
            Delete post
          </Typography>
          <Typography
            className="text-lg text-black-900 dark:text-offWhite"
            font={{ family: 'ABCDiatype', weight: 'Regular' }}
          >
            Are you sure you want to delete this post?
          </Typography>
        </View>

        <View className="space-y-2">
          <Button onPress={handleDelete} text="DELETE" eventElementId={null} eventName={null} />
          <Button
            onPress={handleBack}
            variant="secondary"
            text="CANCEL"
            eventElementId={null}
            eventName={null}
          />
        </View>
      </View>
    </GalleryBottomSheetModal>
  );
}

const ForwardedDeletePostBottomSheet = forwardRef(DeletePostBottomSheet);

export { ForwardedDeletePostBottomSheet as DeletePostBottomSheet };
