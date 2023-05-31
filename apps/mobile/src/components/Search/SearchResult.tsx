import { useMemo } from 'react';
import { StyleSheet, TouchableOpacityProps } from 'react-native';
import { sanitizeMarkdown } from 'src/utils/sanitizeMarkdown';

import { GalleryTouchableOpacity } from '../GalleryTouchableOpacity';
import { Markdown } from '../Markdown';
import { useSearchContext } from './SearchContext';

type Props = {
  title: string;
  description: string;
  variant: 'Gallery' | 'User';
} & TouchableOpacityProps;

const MAX_DESCRIPTION_CHARACTER = 150;

const markdownStyles = StyleSheet.create({
  body: {
    fontSize: 14,
  },
});

export function SearchResult({ title, description, variant, ...props }: Props) {
  const { keyword } = useSearchContext();

  const highlightedName = useMemo(() => {
    if (!keyword) {
      return title;
    }
    return title.replace(new RegExp(keyword, 'gi'), (match) => `**${match}**`);
  }, [keyword, title]);

  const highlightedDescription = useMemo(() => {
    const regex = new RegExp(keyword, 'gi');

    const unformattedDescription = sanitizeMarkdown(description ?? '');
    if (!keyword) {
      return unformattedDescription.substring(0, MAX_DESCRIPTION_CHARACTER);
    }

    const matchIndex = unformattedDescription.search(regex);
    let truncatedDescription;

    const maxLength = MAX_DESCRIPTION_CHARACTER;

    if (matchIndex > -1 && matchIndex + keyword.length === unformattedDescription.length) {
      const endIndex = Math.min(unformattedDescription.length, maxLength);
      truncatedDescription = `...${unformattedDescription.substring(
        endIndex - maxLength,
        endIndex
      )}`;
    } else {
      truncatedDescription = unformattedDescription.substring(0, maxLength);
    }
    // highlight keyword
    return truncatedDescription.replace(regex, (match) => `**${match}**`);
  }, [keyword, description]);

  return (
    <GalleryTouchableOpacity
      className="h-16 py-2 px-4"
      eventElementId="Search Result Row"
      eventName="Search Result Row Clicked"
      properties={{ variant }}
      {...props}
    >
      <Markdown style={markdownStyles}>{highlightedName}</Markdown>
      <Markdown style={markdownStyles} numberOfLines={1}>
        {highlightedDescription}
      </Markdown>
    </GalleryTouchableOpacity>
  );
}
