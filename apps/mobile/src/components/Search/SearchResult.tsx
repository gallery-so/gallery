import { useMemo } from 'react';
import { TouchableOpacity } from 'react-native';

import { Markdown } from '../Markdown';
import { Typography } from '../Typography';

type Props = {
  title: string;
  description: string;
};

const MAX_DESCRIPTION_CHARACTER = 150;

export function SearchResult({ title, description, ...props }: Props) {
  // TODO: use keyword from context
  const keyword = 'jak';

  const highlightedName = useMemo(() => {
    return title.replace(new RegExp(keyword, 'gi'), (match) => `**${match}**`);
  }, [keyword, title]);

  const highlightedDescription = useMemo(() => {
    const regex = new RegExp(keyword, 'gi');

    // Remove bold & link markdown tag from description
    const unformattedDescription = description.replace(/\*\*/g, '').replace(/\[.*\]\(.*\)/g, '');

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
    return truncatedDescription.replace(regex, (match) => `**${match}**`).substring(0, 50);
  }, [keyword, description]);

  return (
    <TouchableOpacity className="py-2" {...props}>
      <Typography
        font={{
          family: 'ABCDiatype',
          weight: 'Regular',
        }}
        className="text-sm"
      >
        <Markdown>{highlightedName}</Markdown>
      </Typography>
      <Typography
        font={{
          family: 'ABCDiatype',
          weight: 'Regular',
        }}
        className="text-sm"
      >
        <Markdown>{highlightedDescription}</Markdown>
      </Typography>
    </TouchableOpacity>
  );
}
