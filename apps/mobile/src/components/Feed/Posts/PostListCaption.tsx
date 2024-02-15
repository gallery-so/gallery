import { useCallback, useMemo, useRef, useState } from 'react';
import { View } from 'react-native';
import { graphql, useFragment } from 'react-relay';

import { GalleryTouchableOpacity } from '~/components/GalleryTouchableOpacity';
import ProcessedText from '~/components/ProcessedText/ProcessedText';
import { PostListCaptionFragment$key } from '~/generated/PostListCaptionFragment.graphql';
import { contexts } from '~/shared/analytics/constants';
import { removeNullValues } from '~/shared/relay/removeNullValues';
import { replaceUrlsWithMarkdownFormat } from '~/shared/utils/replaceUrlsWithMarkdownFormat';

type Props = {
  feedPostRef: PostListCaptionFragment$key;
};

export function PostListCaption({ feedPostRef }: Props) {
  const [showAll, setShowAll] = useState(false);
  const ref = useRef(null);
  const toggleText = useCallback(() => {
    setShowAll(true)
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

  return (
    <View className="px-4 pb-4">
      <View>
        <GalleryTouchableOpacity
          eventElementId="Show more lines"
          eventName="Show more lines"
          eventContext={contexts.Posts}
          onPress={toggleText}
          withoutFeedback={true}
          activeOpacity={0}
          ref={ref}
        >
          <ProcessedText
            suppressHighlighting={true}
            numberOfLines={showAll ? undefined : 4}
            text={captionWithMarkdownLinks}
            mentionsRef={nonNullMentions}

          />
        </GalleryTouchableOpacity>
      </View>
    </View>
  );
}
