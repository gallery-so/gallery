import { ReactNode, useMemo } from 'react';
import { Text, TextProps } from 'react-native';
import { graphql, useFragment } from 'react-relay';

import { Typography } from '~/components/Typography';
import { ProcessedTextFragment$key } from '~/generated/ProcessedTextFragment.graphql';

import { LinkComponent } from './elements/LinkComponent';
import { MentionComponent } from './elements/MentionComponent';
import {
  getMarkdownLinkElements,
  getMentionElements,
  getUrlElements,
  TextElement,
} from './TextElementParser';

type ProcessedTextProps = {
  text: string;
  mentionsRef?: ProcessedTextFragment$key;
} & TextProps;

// Makes a raw text value display-ready by converting urls to link components
export default function ProcessedText({ text, mentionsRef = [], ...props }: ProcessedTextProps) {
  const mentions = useFragment(
    graphql`
      fragment ProcessedTextFragment on Mention @relay(plural: true) {
        __typename
        ...TextElementParserMentionsFragment
        ...MentionComponentFragment
      }
    `,
    mentionsRef
  );

  const processedText = useMemo(() => {
    const markdownElements = getMarkdownLinkElements(text);
    const urlElements = getUrlElements(text, markdownElements);
    const mentionElements = getMentionElements(text, mentions);

    const elements = [...markdownElements, ...urlElements, ...mentionElements];

    // Sort elements based on their start index
    elements.sort((a, b) => a.start - b.start);

    // Construct the final output based on sorted intervals
    const result: ReactNode[] = [];
    let lastEndIndex = 0;

    elements.forEach((element, index) => {
      // Add text before this element (if any)
      addTextElement(result, text.substring(lastEndIndex, element.start), 'text-before', index);
      // Add the element (either mention, URL, or markdown-link)
      addLinkElement(result, element, index);
      lastEndIndex = element.end;
    });

    // Add any remaining text after the last element
    addTextElement(result, text.substring(lastEndIndex), 'text-after', elements.length);

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

const addTextElement = (
  result: ReactNode[],
  value: string,
  type: 'text-before' | 'text-after',
  index: number
) => {
  if (value) result.push(<Text key={`${type}-${index}`}>{value}</Text>);
};

const addLinkElement = (result: ReactNode[], element: TextElement, index: number) => {
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
    result.push(<LinkComponent key={`link-${index}`} url={element.url} value={element.value} />);
  }
};
