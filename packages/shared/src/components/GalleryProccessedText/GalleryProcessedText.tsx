import { ReactNode, useMemo } from 'react';
import { graphql, useFragment } from 'react-relay';

import { GalleryProcessedTextFragment$key } from '~/generated/GalleryProcessedTextFragment.graphql';

import {
  getMarkdownLinkElements,
  getMentionElements,
  getUrlElements,
  TextElement,
} from './GalleryTextElementParser';
import { SupportedProcessedTextElements } from './types';

type GalleryProcessedTextProps = {
  text: string;
  mentionsRef?: GalleryProcessedTextFragment$key;
} & SupportedProcessedTextElements;

// Makes a raw text value display-ready by converting urls to link components
export default function GalleryProcessedText({
  text,
  mentionsRef = [],
  TextComponent,
  LinkComponent,
  MentionComponent,
}: GalleryProcessedTextProps) {
  const mentions = useFragment(
    graphql`
      fragment GalleryProcessedTextFragment on Mention @relay(plural: true) {
        __typename
        ...GalleryTextElementParserMentionsFragment
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
      addTextElement(
        result,
        text.substring(lastEndIndex, element.start),
        'text-before',
        index,
        TextComponent
      );
      // Add the element (either mention, URL, or markdown-link)
      addLinkElement({ result, element, index, LinkComponent, MentionComponent });
      lastEndIndex = element.end;
    });

    // Add any remaining text after the last element
    addTextElement(
      result,
      text.substring(lastEndIndex),
      'text-after',
      elements.length,
      TextComponent
    );

    return result;
  }, [text, mentions, LinkComponent, TextComponent, MentionComponent]);

  return <TextComponent>{processedText}</TextComponent>;
}

const addTextElement = (
  result: ReactNode[],
  value: string,
  type: 'text-before' | 'text-after',
  index: number,
  TextComponent: React.ComponentType<{ children: ReactNode }>
) => {
  if (value) result.push(<TextComponent key={`${type}-${index}`}>{value}</TextComponent>);
};

type addLinkElementProps = {
  result: ReactNode[];
  element: TextElement;
  index: number;
} & Pick<GalleryProcessedTextProps, 'LinkComponent' | 'MentionComponent'>;

const addLinkElement = ({
  result,
  element,
  index,

  LinkComponent,
  MentionComponent,
}: addLinkElementProps) => {
  if (element.type === 'mention' && MentionComponent) {
    result.push(
      <MentionComponent
        key={`mention-${index}`}
        mention={element.value}
        mentionData={element.mentionData || null}
      />
    );
  } else if (element.type === 'url' && LinkComponent) {
    result.push(<LinkComponent key={`link-${index}`} url={element.value} />);
  } else if (element.type === 'markdown-link' && element.url && LinkComponent) {
    result.push(<LinkComponent key={`link-${index}`} url={element.url} value={element.value} />);
  }
};
