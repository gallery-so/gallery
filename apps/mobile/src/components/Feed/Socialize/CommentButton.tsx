import { ViewProps } from 'react-native';

import { GalleryTouchableOpacity } from '~/components/GalleryTouchableOpacity';

import { CommentIcon } from './CommentIcon';

type Props = {
  style?: ViewProps['style'];
  openCommentBottomSheet: () => void;
};

export function CommentButton({ style, openCommentBottomSheet }: Props) {
  return (
    <GalleryTouchableOpacity
      onPress={openCommentBottomSheet}
      className="flex justify-center items-center w-[32] h-[30] pt-1"
      style={style}
      eventElementId="Toggle Comment Box"
      eventName="Toggle Comment Box Clicked"
    >
      <CommentIcon className="h-[20]" />
    </GalleryTouchableOpacity>
  );
}
