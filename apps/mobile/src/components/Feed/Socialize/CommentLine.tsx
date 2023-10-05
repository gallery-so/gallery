import { useNavigation } from '@react-navigation/native';
import { useCallback, useRef, useState } from 'react';
import { StyleSheet, View, ViewProps } from 'react-native';
import { graphql, useFragment } from 'react-relay';
import { useReplaceMentionsWithMarkdownFormat } from 'src/utils/useReplaceMentionsWithMarkdownFormat';

import { WarningLinkBottomSheet } from '~/components/Feed/Posts/WarningLinkBottomSheet';
import { GalleryBottomSheetModalType } from '~/components/GalleryBottomSheet/GalleryBottomSheetModal';
import { GalleryTouchableOpacity } from '~/components/GalleryTouchableOpacity';
import { Markdown } from '~/components/Markdown';
import { UsernameDisplay } from '~/components/UsernameDisplay';
import { CommentLineFragment$key } from '~/generated/CommentLineFragment.graphql';
import { MainTabStackNavigatorProp } from '~/navigation/types';
import { removeNullValues } from '~/shared/relay/removeNullValues';

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
        mentions {
          ...useReplaceMentionsWithMarkdownFormatFragment
        }
      }
    `,
    commentRef
  );

  const [redirectUrl, setRedirectUrl] = useState('');
  const bottomSheetRef = useRef<GalleryBottomSheetModalType | null>(null);
  const navigation = useNavigation<MainTabStackNavigatorProp>();

  const caption = useReplaceMentionsWithMarkdownFormat(
    comment.comment,
    removeNullValues(comment.mentions)
  );

  // TODO: Update this when kaito new component is ready
  const handleLinkPress = useCallback(
    (url: string) => {
      // if gallery link, redirect to profile
      if (url.includes('https://gallery.so/')) {
        const username = url.split('https://gallery.so/')[1];

        navigation.push('Profile', { username: username ?? '', hideBackButton: false });
        return;
      }

      bottomSheetRef.current?.present();
      setRedirectUrl(url);
    },
    [navigation]
  );

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
          {caption}
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
  paragraph: {
    marginBottom: 0,
  },
});
