import { useNavigation } from '@react-navigation/native';
import { ReactNode, useCallback, useMemo, useRef } from 'react';
import { Text } from 'react-native';
import { graphql, useFragment } from 'react-relay';

import { GalleryBottomSheetModalType } from '~/components/GalleryBottomSheet/GalleryBottomSheetModal';
import { Typography } from '~/components/Typography';
import { ProcessedCommentTextFragment$key } from '~/generated/ProcessedCommentTextFragment.graphql';
import { ProcessedCommentTextMentionFragment$key } from '~/generated/ProcessedCommentTextMentionFragment.graphql';
import { MainTabStackNavigatorProp } from '~/navigation/types';
import { VALID_URL } from '~/shared/utils/regex';

import { WarningLinkBottomSheet } from '../Posts/WarningLinkBottomSheet';

type LinkProps = {
  url: string;
};

const LinkComponent = ({ url }: LinkProps) => {
  const bottomSheetRef = useRef<GalleryBottomSheetModalType | null>(null);
  const handleLinkPress = useCallback(() => {
    bottomSheetRef.current?.present();
  }, []);

  return (
    <>
      <Text className="text-shadow" onPress={handleLinkPress}>
        {url}
      </Text>
      <WarningLinkBottomSheet redirectUrl={url} ref={bottomSheetRef} />
    </>
  );
};

type MentionProps = {
  mention: string;
  mentionRef: ProcessedCommentTextMentionFragment$key;
};

const MentionComponent = ({ mention, mentionRef }: MentionProps) => {
  const mentionData = useFragment(
    graphql`
      fragment ProcessedCommentTextMentionFragment on Mention {
        __typename
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
    mentionRef
  );

  const navigation = useNavigation<MainTabStackNavigatorProp>();

  const onMentionPress = useCallback(() => {
    if (mentionData.entity?.__typename === 'GalleryUser') {
      navigation.navigate('Profile', {
        username: mentionData.entity.username ?? '',
      });
      return;
    }

    if (mentionData.entity?.__typename === 'Community') {
      navigation.navigate('Community', {
        contractAddress: mentionData.entity.contractAddress?.address ?? '',
        chain: mentionData.entity.contractAddress?.chain ?? '',
      });
    }
  }, [mentionData, navigation]);

  return (
    <Text className="text-shadow" onPress={onMentionPress}>
      {mention}
    </Text>
  );
};

type CommentProps = {
  comment: string;
  mentionsRef: ProcessedCommentTextFragment$key;
};

type CommentElement = {
  type: 'mention' | 'url';
  value: string;
  start: number;
  end: number;
  mentionRef?: ProcessedCommentTextMentionFragment$key;
};

// Makes a raw comment value display-ready by converting urls to link components
export default function ProcessedCommentText({ comment, mentionsRef }: CommentProps) {
  const mentions = useFragment(
    graphql`
      fragment ProcessedCommentTextFragment on Mention @relay(plural: true) {
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
        ...ProcessedCommentTextMentionFragment
      }
    `,
    mentionsRef
  );

  const processedText = useMemo(() => {
    const elements: CommentElement[] = [];

    // Add mentions from the Relay fragment to the elements array
    mentions?.forEach((mention) => {
      if (!mention?.entity || !mention?.interval) return;

      const { start, length } = mention.interval;
      const mentionText = comment.substring(start, start + length);

      elements.push({
        type: 'mention',
        value: mentionText,
        start: start,
        end: start + length,
        mentionRef: mention,
      });
    });

    // Identify URLs and add them to the elements array
    const urlMatches = comment.match(VALID_URL);
    urlMatches?.forEach((match) => {
      const startIndex = comment.indexOf(match);
      elements.push({
        type: 'url',
        value: match,
        start: startIndex,
        end: startIndex + match.length,
      });
    });

    // Sort elements based on their start index
    elements.sort((a, b) => a.start - b.start);

    // Construct the final output based on sorted intervals
    const result: ReactNode[] = [];
    let lastEndIndex = 0;

    elements.forEach((element, index) => {
      // Add text before this element (if any)
      const beforeText = comment.substring(lastEndIndex, element.start);
      if (beforeText) {
        result.push(<Text key={`text-before-${index}`}>{beforeText}</Text>);
      }

      // Add the element (either mention or URL)
      if (element.type === 'mention' && element.mentionRef) {
        result.push(
          <MentionComponent
            key={`mention-${index}`}
            mention={element.value}
            mentionRef={element.mentionRef}
          />
        );
      } else {
        result.push(<LinkComponent key={`link-${index}`} url={element.value} />);
      }

      lastEndIndex = element.end;
    });

    // Add any remaining text after the last element
    const afterText = comment.substring(lastEndIndex);
    if (afterText) {
      result.push(<Text key="text-after">{afterText}</Text>);
    }

    return result;
  }, [comment, mentions]);

  return (
    <Typography
      className="text-sm"
      font={{ family: 'ABCDiatype', weight: 'Regular' }}
      style={{ fontSize: 14, lineHeight: 18, paddingVertical: 2 }}
    >
      {processedText}
    </Typography>
  );
}
