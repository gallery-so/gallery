import { useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { graphql, useFragment } from 'react-relay';

import { GalleryBottomSheetModalType } from '~/components/GalleryBottomSheet/GalleryBottomSheetModal';
import { Markdown } from '~/components/Markdown';
import { PostListCaptionFragment$key } from '~/generated/PostListCaptionFragment.graphql';
import { convertToMarkdownLinks } from '~/shared/utils/convertToMarkdownLinks';

import { WarningLinkBottomSheet } from './WarningLinkBottomSheet';

type Props = {
  feedPostRef: PostListCaptionFragment$key;
};

export function PostListCaption({ feedPostRef }: Props) {
  const feedPost = useFragment(
    graphql`
      fragment PostListCaptionFragment on Post {
        __typename
        caption
      }
    `,
    feedPostRef
  );

  const [redirectUrl, setRedirectUrl] = useState('');
  const { caption } = feedPost;

  const captionWithMarkdownLinks = convertToMarkdownLinks(caption ?? '');

  const handleLinkPress = (url: string) => {
    bottomSheetRef.current?.present();
    setRedirectUrl(url);
  };

  const bottomSheetRef = useRef<GalleryBottomSheetModalType | null>(null);

  return (
    <View className="px-4 pb-4">
      <Markdown onBypassLinkPress={handleLinkPress} style={markdownStyles}>
        {captionWithMarkdownLinks}
      </Markdown>
      <WarningLinkBottomSheet redirectUrl={redirectUrl} ref={bottomSheetRef} />
    </View>
  );
}

const markdownStyles = StyleSheet.create({
  body: {
    fontSize: 14,
  },
});
