import { Text, TouchableOpacity } from 'react-native';

import { Markdown } from '../Markdown';

type Props = {
  title: string;
  description: string;
};

export function SearchResult({ title, description, ...props }: Props) {
  return (
    <TouchableOpacity className="py-2" {...props}>
      <Text>{title}</Text>
      <Text numberOfLines={1}>
        <Markdown>{description}</Markdown>
      </Text>
    </TouchableOpacity>
  );
}
