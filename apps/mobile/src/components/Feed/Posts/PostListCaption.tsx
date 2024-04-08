import { LinearGradient } from 'expo-linear-gradient';
import { useCallback, useMemo, useState } from 'react';
import React from 'react';
import { NativeSyntheticEvent, StyleSheet, TextLayoutEventData, View } from 'react-native';
import { graphql, useFragment } from 'react-relay';
import { useGradientColorScheme } from 'src/hooks/useGradientColorScheme';

import { GalleryTouchableOpacity } from '~/components/GalleryTouchableOpacity';
import ProcessedText from '~/components/ProcessedText/ProcessedText';
import { PostListCaptionFragment$key } from '~/generated/PostListCaptionFragment.graphql';
import { removeNullValues } from '~/shared/relay/removeNullValues';
import { replaceUrlsWithMarkdownFormat } from '~/shared/utils/replaceUrlsWithMarkdownFormat';

type Props = {
  feedPostRef: PostListCaptionFragment$key;
};

export function PostListCaption({ feedPostRef }: Props) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [textHeight, setTextHeight] = useState(0);
  const gradientColors = useGradientColorScheme();

  const toggleExpanded = useCallback(() => {
    setIsExpanded((prev) => !prev);
  }, []);

  const feedPost = useFragment(
    graphql`
      fragment PostListCaptionFragment on Post {
        __typename
        caption
        mentions {
          ...ProcessedTextFragment
        }
      }
    `,
    feedPostRef
  );

  const { caption } = feedPost;
  const captionWithMarkdownLinks = replaceUrlsWithMarkdownFormat(caption ?? '');

  const nonNullMentions = useMemo(() => removeNullValues(feedPost.mentions), [feedPost.mentions]);

  const handleTextLayout = useCallback((e: NativeSyntheticEvent<TextLayoutEventData>) => {
    const { lines } = e.nativeEvent;
    if (lines.length >= 4) {
      setTextHeight(e.nativeEvent.lines[3]?.height || 0);
    } else {
      setTextHeight(0);
    }
  }, []);

  const shouldShowGradient = textHeight > 0 && !isExpanded;

  return (
    <GalleryTouchableOpacity
      onPress={toggleExpanded}
      activeOpacity={0.7}
      eventElementId={null}
      eventName={null}
      eventContext={null}
    >
      <View key={isExpanded ? 'expanded' : 'collapsed'} className="px-4 pb-4">
        <ProcessedText
          numberOfLines={isExpanded ? undefined : 4}
          text={captionWithMarkdownLinks}
          mentionsRef={nonNullMentions}
          onTextLayout={handleTextLayout}
        />
        {shouldShowGradient ? (
          <LinearGradient
            colors={gradientColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            locations={[0.4, 1]}
            style={styles.linearGradientContainer}
          />
        ) : null}
      </View>
    </GalleryTouchableOpacity>
  );
}

const styles = StyleSheet.create({
  text: {
    fontSize: 14,
    lineHeight: 18,
  },
  linearGradientContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
});
