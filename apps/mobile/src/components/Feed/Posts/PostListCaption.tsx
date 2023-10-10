import { View } from 'react-native';
import { graphql, useFragment } from 'react-relay';

import { PostListCaptionFragment$key } from '~/generated/PostListCaptionFragment.graphql';
import { removeNullValues } from '~/shared/relay/removeNullValues';
import { replaceUrlsWithMarkdownFormat } from '~/shared/utils/replaceUrlsWithMarkdownFormat';

import ProcessedText from '../Socialize/ProcessedText';

type Props = {
  feedPostRef: PostListCaptionFragment$key;
};

export function PostListCaption({ feedPostRef }: Props) {
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

  return (
    <View className="px-4 pb-4">
      <ProcessedText
        comment={captionWithMarkdownLinks}
        mentionsRef={removeNullValues(feedPost.mentions)}
      />
    </View>
  );
}
