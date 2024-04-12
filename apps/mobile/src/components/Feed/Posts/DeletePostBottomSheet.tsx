import { forwardRef, useCallback, useMemo } from 'react';
import { View } from 'react-native';
import { graphql, useFragment } from 'react-relay';

import { Button } from '~/components/Button';
import { Typography } from '~/components/Typography';
import { useBottomSheetModalActions } from '~/contexts/BottomSheetModalContext';
import { DeletePostBottomSheetFragment$key } from '~/generated/DeletePostBottomSheetFragment.graphql';
import { usePost } from '~/screens/PostScreen/usePost';
import { contexts } from '~/shared/analytics/constants';
import { removeNullValues } from '~/shared/relay/removeNullValues';

type Props = {
  postRef: DeletePostBottomSheetFragment$key;
};

export default function DeletePostBottomSheet({ postRef }: Props) {
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

  const { hideBottomSheetModal } = useBottomSheetModalActions();

  const handleBack = useCallback(() => {
    hideBottomSheetModal();
  }, [hideBottomSheetModal]);

  const handleDelete = useCallback(() => {
    deletePost(post.dbid);
    hideBottomSheetModal();
  }, [deletePost, hideBottomSheetModal, post.dbid]);

  return (
    <View className="flex flex-col space-y-6">
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
        <Button
          onPress={handleDelete}
          text="DELETE"
          eventElementId="Delete Post Button"
          eventName="Delete Post"
          eventContext={contexts.Posts}
        />
        <Button
          onPress={handleBack}
          variant="secondary"
          text="CANCEL"
          eventElementId="Cancel Delete Post Button"
          eventName="Cancel Delete Post"
          eventContext={contexts.Posts}
        />
      </View>
    </View>
  );
}
