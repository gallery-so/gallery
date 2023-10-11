import { useNavigation } from '@react-navigation/native';
import { ReactNode, useCallback, useMemo, useRef } from 'react';
import { Text, TextProps } from 'react-native';
import { graphql, useFragment } from 'react-relay';

import { GalleryBottomSheetModalType } from '~/components/GalleryBottomSheet/GalleryBottomSheetModal';
import { Typography } from '~/components/Typography';
import { ProcessedTextFragment$key } from '~/generated/ProcessedTextFragment.graphql';
import { ProcessedTextMentionFragment$key } from '~/generated/ProcessedTextMentionFragment.graphql';
import { MainTabStackNavigatorProp } from '~/navigation/types';
import { VALID_URL } from '~/shared/utils/regex';

import { WarningLinkBottomSheet } from '../Posts/WarningLinkBottomSheet';

const MARKDOWN_LINK_REGEX = /\[([^\]]+)]\((https?:\/\/[^\s]+)\)/g;

type LinkProps = {
  value?: string;
  url: string;
};

const LinkComponent = ({ url, value }: LinkProps) => {
  const bottomSheetRef = useRef<GalleryBottomSheetModalType | null>(null);
  const handleLinkPress = useCallback(() => {
    bottomSheetRef.current?.present();
  }, []);

  return (
    <>
      <Text className="text-shadow" onPress={handleLinkPress}>
        {value ?? url}
      </Text>
      <WarningLinkBottomSheet redirectUrl={url} ref={bottomSheetRef} />
    </>
  );
};

type MentionProps = {
  mention: string;
  mentionRef: ProcessedTextMentionFragment$key;
};

const MentionComponent = ({ mention, mentionRef }: MentionProps) => {
  const mentionData = useFragment(
    graphql`
      fragment ProcessedTextMentionFragment on Mention {
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

type ProcessedTextProps = {
  text: string;
  mentionsRef?: ProcessedTextFragment$key;
} & TextProps;

type TextElement = {
  type: 'mention' | 'url' | 'markdown-link';
  value: string;
  start: number;
  end: number;
  mentionRef?: ProcessedTextMentionFragment$key;
  url?: string;
};

// Makes a raw text value display-ready by converting urls to link components
export default function ProcessedText({ text, mentionsRef = [], ...props }: ProcessedTextProps) {
  const mentions = useFragment(
    graphql`
      fragment ProcessedTextFragment on Mention @relay(plural: true) {
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
        ...ProcessedTextMentionFragment
      }
    `,
    mentionsRef
  );

  const processedText = useMemo(() => {
    const elements: TextElement[] = [];

    // Add mentions from the Relay fragment to the elements array
    mentions?.forEach((mention) => {
      if (!mention?.entity || !mention?.interval) return;

      const { start, length } = mention.interval;
      const mentionText = text.substring(start, start + length);

      elements.push({
        type: 'mention',
        value: mentionText,
        start: start,
        end: start + length,
        mentionRef: mention,
      });
    });

    // Identify markdown-style links and add them to the elements array
    const markdownLinkMatches = text.matchAll(MARKDOWN_LINK_REGEX);
    for (const match of markdownLinkMatches) {
      const [fullMatch, linkText, linkUrl] = match;
      const startIndex = match.index ?? 0;

      elements.push({
        type: 'markdown-link',
        // If there's no link text, then we use the link URL as the value
        value: linkText ?? linkUrl ?? '',
        start: startIndex,
        end: startIndex + fullMatch.length,
        url: linkUrl,
      });
    }

    // Identify URLs and add them to the elements array
    const URL_REGEX = new RegExp(VALID_URL, 'g'); // Make sure the URL regex has the 'g' flag
    let urlMatch;
    while ((urlMatch = URL_REGEX.exec(text)) !== null) {
      const [match] = urlMatch;
      const startIndex = urlMatch.index;
      const endIndex = startIndex + match.length;

      // Before pushing a URL to the elements array, we check if it's within a markdown link. If it's not, then we push it.
      if (!isWithinMarkdownLink(startIndex, endIndex, elements)) {
        elements.push({
          type: 'url',
          value: match,
          start: startIndex,
          end: endIndex,
        });
      }
    }

    // Sort elements based on their start index
    elements.sort((a, b) => a.start - b.start);

    // Construct the final output based on sorted intervals
    const result: ReactNode[] = [];
    let lastEndIndex = 0;

    elements.forEach((element, index) => {
      // Add text before this element (if any)
      const beforeText = text.substring(lastEndIndex, element.start);
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
      } else if (element.type === 'url') {
        result.push(<LinkComponent key={`link-${index}`} url={element.value} />);
      } else if (element.type === 'markdown-link' && element.url) {
        result.push(
          <LinkComponent key={`link-${index}`} url={element.url} value={element.value} />
        );
      }

      lastEndIndex = element.end;
    });

    // Add any remaining text after the last element
    const afterText = text.substring(lastEndIndex);
    if (afterText) {
      result.push(<Text key="text-after">{afterText}</Text>);
    }

    return result;
  }, [text, mentions]);

  return (
    <Typography
      className="text-sm"
      font={{ family: 'ABCDiatype', weight: 'Regular' }}
      style={{ fontSize: 14, lineHeight: 18, paddingVertical: 2 }}
      {...props}
    >
      {processedText}
    </Typography>
  );
}

function isWithinMarkdownLink(start: number, end: number, elements: TextElement[]) {
  for (const element of elements) {
    if (element.type === 'markdown-link' && start >= element.start && end <= element.end) {
      return true;
    }
  }
  return false;
}
