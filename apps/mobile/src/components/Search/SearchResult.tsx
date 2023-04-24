import { useMemo } from 'react';
import { StyleSheet, TouchableOpacity, TouchableOpacityProps } from 'react-native';

import { Markdown } from '../Markdown';
import { useSearchContext } from './SearchContext';

type Props = {
  title: string;
  description: string;
} & TouchableOpacityProps;

const MAX_DESCRIPTION_CHARACTER = 150;

const markdownStyles = StyleSheet.create({
  body: {
    fontSize: 14,
  },
});

export function SearchResult({ title, description, ...props }: Props) {
  const { keyword } = useSearchContext();

  const highlightedName = useMemo(() => {
    return title.replace(new RegExp(keyword, 'gi'), (match) => `**${match}**`);
  }, [keyword, title]);

  const highlightedDescription = useMemo(() => {
    const regex = new RegExp(keyword, 'gi');

    // Clean the markdown
    const unformattedDescription = description
      .replace(/\*\*/g, '') // bold
      .replace(/\[.*\]\(.*\)/g, '') // link markdown tag from description
      .replace(/\n/g, ' '); // break line

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
    <TouchableOpacity className="h-16 py-2 px-4" {...props}>
      <Markdown style={markdownStyles}>{highlightedName}</Markdown>
      <Markdown style={markdownStyles} numberOfLines={1}>
        {highlightedDescription}
      </Markdown>
    </TouchableOpacity>
  );
}
