import { useMemo } from 'react';
import { graphql, useFragment } from 'react-relay';

import { useReplaceMentionsWithMarkdownFormatFragment$key } from '~/generated/useReplaceMentionsWithMarkdownFormatFragment.graphql';
import { replaceUrlsWithMarkdownFormat } from '~/shared/utils/replaceUrlsWithMarkdownFormat';

export function useReplaceMentionsWithMarkdownFormat(
  comment: string,
  mentionsRef: useReplaceMentionsWithMarkdownFormatFragment$key
) {
  const mentions = useFragment(
    graphql`
      fragment useReplaceMentionsWithMarkdownFormatFragment on Mention @relay(plural: true) {
        __typename
        interval {
          __typename
          start
          length
        }
        entity {
          __typename
          ... on GalleryUser {
            __typename
            username
          }
          ... on Community {
            __typename
            contractAddress {
              __typename
              address
              chain
            }
          }
        }
      }
    `,
    mentionsRef
  );

  const captionWithMentions = useMemo(() => {
    let captionWithMarkdownLinks = comment;

    mentions.forEach((mention) => {
      if (!mention?.entity || !mention?.interval) return;

      const { start, length } = mention.interval;

      const mentionText = comment.slice(start, start + length);

      let markdownLink = '';

      if (mention.entity.__typename === 'GalleryUser') {
        markdownLink = `[${mentionText}](https://gallery.so/${mention.entity.username})`;
      } else if (mention.entity.__typename === 'Community') {
        if (!mention.entity.contractAddress) return;

        const { address, chain } = mention.entity.contractAddress;

        markdownLink = `[${mentionText}](https://gallery.so/community/${chain}/${address})`;
      }

      captionWithMarkdownLinks = captionWithMarkdownLinks.replace(mentionText, markdownLink);
    });

    captionWithMarkdownLinks = replaceUrlsWithMarkdownFormat(captionWithMarkdownLinks);

    return captionWithMarkdownLinks;
  }, [comment, mentions]);

  return captionWithMentions;
}
