import { graphql, readInlineData } from 'react-relay';

import { GalleryProcessedTextFragment$data } from '~/generated/GalleryProcessedTextFragment.graphql';
import {
  GalleryTextElementParserMentionsFragment$data,
  GalleryTextElementParserMentionsFragment$key,
} from '~/generated/GalleryTextElementParserMentionsFragment.graphql';

import { MARKDOWN_LINK_REGEX, VALID_URL } from '../../utils/regex';

export type TextElement = {
  type: 'mention' | 'url' | 'markdown-link';
  value: string;
  start: number;
  end: number;
  url?: string;
  mentionData?: GalleryTextElementParserMentionsFragment$data['entity'];
};

export function getMentionElements(
  text: string,
  mentionRefs: GalleryProcessedTextFragment$data
): TextElement[] {
  function fetchMention(mentionRef: GalleryTextElementParserMentionsFragment$key) {
    return readInlineData(
      graphql`
        fragment GalleryTextElementParserMentionsFragment on Mention @inline {
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
      mentionRef
    );
  }

  const mentions: GalleryTextElementParserMentionsFragment$data[] = [];

  mentionRefs.forEach((mentionRef) => {
    mentions.push(fetchMention(mentionRef));
  });

  const elements: TextElement[] = [];

  mentions?.forEach((mention) => {
    if (!mention?.entity || !mention?.interval) return;

    const { start, length } = mention.interval;
    const mentionText = text.substring(start, start + length);

    elements.push({
      type: 'mention',
      value: mentionText,
      start: start,
      end: start + length,
      mentionData: mention.entity,
    });
  });

  return elements;
}

export function getMarkdownLinkElements(text: string): TextElement[] {
  const elements: TextElement[] = [];

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

  return elements;
}

export function getUrlElements(text: string, existingElements: TextElement[] = []): TextElement[] {
  const elements: TextElement[] = [];

  const URL_REGEX = new RegExp(VALID_URL, 'g'); // Make sure the URL regex has the 'g' flag
  let urlMatch;
  while ((urlMatch = URL_REGEX.exec(text)) !== null) {
    const [match] = urlMatch;
    const startIndex = urlMatch.index;
    const endIndex = startIndex + match.length;

    // Before pushing a URL to the elements array, we check if it's within a markdown link.
    // If it's not, then we push it.
    if (!isWithinMarkdownLink(startIndex, endIndex, existingElements)) {
      elements.push({
        type: 'url',
        value: match,
        start: startIndex,
        end: endIndex,
      });
    }
  }

  return elements;
}

function isWithinMarkdownLink(start: number, end: number, elements: TextElement[]) {
  for (const element of elements) {
    if (element.type === 'markdown-link' && start >= element.start && end <= element.end) {
      return true;
    }
  }
  return false;
}
