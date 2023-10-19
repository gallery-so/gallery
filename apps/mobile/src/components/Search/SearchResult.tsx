import { ReactNode, useMemo } from 'react';
import { StyleSheet, TouchableOpacityProps } from 'react-native';
import { View } from 'react-native';

import { contexts } from '~/shared/analytics/constants';
import { getHighlightedDescription,getHighlightedName } from '~/shared/utils/highlighter';

import { GalleryTouchableOpacity } from '../GalleryTouchableOpacity';
import { Markdown } from '../Markdown';

type Props = {
  title: string;
  description: string;
  variant: 'Gallery' | 'User';
  profilePicture?: ReactNode;
  keyword: string;
} & TouchableOpacityProps;

const markdownStyles = StyleSheet.create({
  paragraph: {
    marginBottom: 0,
  },
  body: {
    fontSize: 14,
  },
});

export function SearchResult({
  title,
  description,
  keyword,
  variant,
  profilePicture,
  ...props
}: Props) {
  const highlightedName = useMemo(() => getHighlightedName(title, keyword), [keyword, title]);

  const highlightedDescription = useMemo(
    () => getHighlightedDescription(description, keyword),
    [keyword, description]
  );

  return (
    <GalleryTouchableOpacity
      className="py-2 px-4 max-h-16 flex flex-row items-center space-x-2"
      eventElementId="Search Result Row"
      eventName="Search Result Row Clicked"
      eventContext={contexts.Search}
      properties={{ variant }}
      {...props}
    >
      {profilePicture}
      <View className="flex flex-grow flex-1 flex-col space-y-1">
        <View>
          <Markdown style={markdownStyles}>{highlightedName}</Markdown>
        </View>
        {highlightedDescription && (
          <View>
            <Markdown style={markdownStyles} numberOfLines={1}>
              {highlightedDescription}
            </Markdown>
          </View>
        )}
      </View>
    </GalleryTouchableOpacity>
  );
}
