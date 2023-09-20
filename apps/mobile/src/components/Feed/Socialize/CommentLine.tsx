import { View, ViewProps, StyleSheet } from 'react-native';
import { graphql, useFragment } from 'react-relay';
import { useCallback, useRef, useState } from 'react';

import { GalleryTouchableOpacity } from '~/components/GalleryTouchableOpacity';
import { UsernameDisplay } from '~/components/UsernameDisplay';
import { GalleryBottomSheetModalType } from '~/components/GalleryBottomSheet/GalleryBottomSheetModal';
import { CommentLineFragment$key } from '~/generated/CommentLineFragment.graphql';
import { Markdown } from '~/components/Markdown';
import { replaceUrlsWithMarkdownFormat } from '~/shared/utils/replaceUrlsWithMarkdownFormat';
import { WarningLinkBottomSheet } from '../Posts/WarningLinkBottomSheet';

type Props = {
  commentRef: CommentLineFragment$key;
  style?: ViewProps['style'];
  onCommentPress?: () => void;
};

export function CommentLine({ commentRef, style, onCommentPress }: Props) {
  const comment = useFragment(
    graphql`
      fragment CommentLineFragment on Comment {
        comment @required(action: THROW)
        commenter @required(action: THROW) {
          ...UsernameDisplayFragment
        }
      }
    `,
    commentRef
  );
  const [redirectUrl, setRedirectUrl] = useState('');
  const bottomSheetRef = useRef<GalleryBottomSheetModalType | null>(null);
  const captionWithMarkdownLinks = replaceUrlsWithMarkdownFormat(comment.comment ?? '');

  const handleLinkPress = useCallback((url: string) => {
    bottomSheetRef.current?.present();
    setRedirectUrl(url);
  }, []);

  return (
    <View className="flex flex-row space-x-1" style={style}>
      <UsernameDisplay userRef={comment.commenter} size="sm" />
      <GalleryTouchableOpacity
        onPress={onCommentPress}
        eventElementId={null}
        eventName={null}
        className="flex flex-row wrap"
      >
        <Markdown onBypassLinkPress={handleLinkPress} style={markdownStyles}>
          {captionWithMarkdownLinks}
        </Markdown>
        <WarningLinkBottomSheet redirectUrl={redirectUrl} ref={bottomSheetRef} />
      </GalleryTouchableOpacity>
    </View>
  );
}

const markdownStyles = StyleSheet.create({
  body: {
    fontSize: 14,
  },
});
