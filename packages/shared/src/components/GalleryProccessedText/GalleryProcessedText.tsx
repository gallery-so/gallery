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
import { MentionDataType } from 'src/hooks/useMentionableMessage';

type GalleryProcessedTextProps = {
  text: string;
  mentionsRef?: GalleryProcessedTextFragment$key;
  mentionsInText?: MentionDataType[];
} & SupportedProcessedTextElements;

// Makes a raw text value display-ready by converting urls to link components
export default function GalleryProcessedText({
  text,
  mentionsRef = [],
  BreakComponent,
  TextComponent,
  LinkComponent,
  MentionComponent,
  mentionsInText = [],
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
    const elementsWithBreaks: JSX.Element[] = [];
    const markdownLinks = getMarkdownLinkElements(text);
    const elements = [
      ...markdownLinks,
      ...getUrlElements(text, markdownLinks),
      ...getMentionElements(text, mentions, mentionsInText),
    ];

    // Sort elements based on their start index
    elements.sort((a, b) => a.start - b.start);

    let lastEndIndex = 0;
    elements.forEach((element, index) => {
      // Split any text containing newlines into parts, inserting BreakComponent between parts
      const textSegment = text.substring(lastEndIndex, element.start);
      const textParts = textSegment.split('\n');
      textParts.forEach((part, partIndex) => {
        if (part)
          elementsWithBreaks.push(
            <TextComponent key={`${index}-part-${partIndex}`}>{part}</TextComponent>
          );
        if (partIndex < textParts.length - 1)
          elementsWithBreaks.push(<BreakComponent key={`${index}-break-${partIndex}`} />);
      });

      // Add the element (either mention, URL, or markdown-link)
      addLinkElement({
        result: elementsWithBreaks,
        element,
        index,
        LinkComponent,
        MentionComponent,
      });
      lastEndIndex = element.end;
    });

    // Handle any remaining text after the last element
    const remainingText = text.substring(lastEndIndex);
    const remainingParts = remainingText.split('\n');
    remainingParts.forEach((part, partIndex) => {
      if (part)
        elementsWithBreaks.push(
          <TextComponent key={`remaining-part-${partIndex}`}>{part}</TextComponent>
        );
      if (partIndex < remainingParts.length - 1)
        elementsWithBreaks.push(<BreakComponent key={`remaining-break-${partIndex}`} />);
    });

    return elementsWithBreaks;
  }, [text, mentions, LinkComponent, TextComponent, MentionComponent, BreakComponent]);

  return <TextComponent>{processedText}</TextComponent>;
}

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
