import { useState } from 'react';
import { View, StyleSheet, Linking, Modal } from 'react-native';
import { graphql, useFragment } from 'react-relay';
import { Typography } from '~/components/Typography';
import { Markdown } from '~/components/Markdown';

import { GalleryTouchableOpacity } from '~/components/GalleryTouchableOpacity';
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

  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [url, setUrl] = useState('');

  // Function to convert URLs to Markdown links
  const convertToMarkdownLinks = (text: string) => {
    return text.replace(urlRegex, (url: string) => {
      return `[${url}](${url})`;
    });
  };

  const captionWithMarkdownLinks = convertToMarkdownLinks(caption ?? '');

  const handleLinkPress = (url: string) => {
    setShowConfirmationModal(true);
    setUrl(url);
  };

  const handleOnCancel = () => setShowConfirmationModal(false);

  const handleOnConfirm = () => Linking.openURL(url);

  return (
    <View className="px-4 pb-4">
      <Markdown onLinkPress={handleLinkPress} style={markdownStyles}>
        {captionWithMarkdownLinks}
      </Markdown>
      <Modal visible={showConfirmationModal} animationType="slide">
        <View>
          <Typography className="text-sm" font={{ family: 'ABCDiatype', weight: 'Regular' }}>
            - Do you want to navigate to the following link on your mobile browser?:{' '}
          </Typography>
          <Typography className="text-sm" font={{ family: 'ABCDiatype', weight: 'Regular' }}>
            {url}
          </Typography>

          <GalleryTouchableOpacity onPress={handleOnCancel} eventElementId={null} eventName={null}>
            <Typography className="text-sm" font={{ family: 'ABCDiatype', weight: 'Regular' }}>
              Cancel
            </Typography>
          </GalleryTouchableOpacity>
          <GalleryTouchableOpacity onPress={handleOnConfirm} eventElementId={null} eventName={null}>
            <Typography className="text-sm" font={{ family: 'ABCDiatype', weight: 'Regular' }}>
              Confirm
            </Typography>
          </GalleryTouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}
