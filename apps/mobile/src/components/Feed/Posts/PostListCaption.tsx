import { useState, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import { graphql, useFragment } from 'react-relay';
import { Markdown } from '~/components/Markdown';
import { WarningLinkBottomSheet } from './WarningLinkBottomSheet';

import { GalleryBottomSheetModalType } from '~/components/GalleryBottomSheet/GalleryBottomSheetModal';
import { PostListCaptionFragment$key } from '~/generated/PostListCaptionFragment.graphql';

type Props = {
  feedPostRef: PostListCaptionFragment$key;
};

const markdownStyles = StyleSheet.create({
  body: {
    fontSize: 14,
  },
});

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

  const { caption } = feedPost;

  // Regular expression to match URLs
  const urlRegex = /(?:https?|ftp):\/\/[^\s/$.?#].[^\s]*[^\s.,!?#$]/g;

  const [url, setUrl] = useState('');

  // Function to convert URLs to Markdown links
  const convertToMarkdownLinks = (text: string) => {
    return text.replace(urlRegex, (url: string) => {
      return `[${url}](${url})`;
    });
  };

  const captionWithMarkdownLinks = convertToMarkdownLinks(caption ?? '');

  const handleLinkPress = (url: string) => {
    bottomSheetRef.current?.present();
    setUrl(url);
  };

  const bottomSheetRef = useRef<GalleryBottomSheetModalType | null>(null);

  return (
    <View className="px-4 pb-4">
      <Markdown onLinkPress={handleLinkPress} style={markdownStyles}>
        {captionWithMarkdownLinks}
      </Markdown>
      <WarningLinkBottomSheet url={url} ref={bottomSheetRef} />
    </View>
  );
}
