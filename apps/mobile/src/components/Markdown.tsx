import merge from 'lodash.merge';
import { useColorScheme } from 'nativewind';
import { PropsWithChildren, useCallback, useMemo, useState } from 'react';
import { StyleProp, Text, View } from 'react-native';
import MarkdownDisplay, { MarkdownIt, RenderRules } from 'react-native-markdown-display';

import colors from '~/shared/theme/colors';

import { GalleryTouchableOpacity } from './GalleryTouchableOpacity';

const markdownStyles = {
  paragraph: {
    marginTop: 0,
  },
  body: {
    fontSize: 14,
    fontFamily: 'ABCDiatypeRegular',
  },
};

const darkModeMarkdownStyles = {
  body: {
    color: colors.offWhite,
  },
  link: {
    color: '#9E9E9E',
    textDecorationLine: 'none',
  },
};

const lightModeMarkdownStyles = {
  body: {
    color: colors.black['800'],
  },
  link: {
    color: '#707070',
    textDecorationLine: 'none',
  },
};

type GalleryMarkdownProps = PropsWithChildren<{
  // if provided, this function will be executed instead of navigating to the pressed link
  onBypassLinkPress?: (url: string) => void;
  numberOfLines?: number;
  touchToExpand?: boolean;
  style?: StyleProp<unknown>;
}>;

const markdownItOptions = MarkdownIt({ typographer: true, linkify: false }).disable(['lheading']);

export function Markdown({
  children,
  onBypassLinkPress,
  touchToExpand = false,
  numberOfLines,
  style,
}: GalleryMarkdownProps) {
  const [showAll, setShowAll] = useState(false);
  const { colorScheme } = useColorScheme();

  const mergedStyles = useMemo(() => {
    const mergedStyles = { ...markdownStyles };

    if (colorScheme === 'dark') {
      merge(mergedStyles, darkModeMarkdownStyles);
    }

    if (colorScheme === 'light') {
      merge(mergedStyles, lightModeMarkdownStyles);
    }

    merge(mergedStyles, style);

    return mergedStyles;
  }, [colorScheme, style]);

  const rules = useMemo<RenderRules>(() => {
    const rules: RenderRules = {};

    if (numberOfLines) {
      rules.textgroup = (node, children, parent, styles) => (
        <Text
          key={node.key}
          style={styles.textgroup}
          numberOfLines={showAll ? undefined : numberOfLines}
        >
          {children}
        </Text>
      );
      rules.body = (node, children, parent, styles) => (
        <View key={node.key} style={styles.body}>
          <Text numberOfLines={numberOfLines}>{children}</Text>
        </View>
      );
    }

    return rules;
  }, [numberOfLines, showAll]);

  const handlePress = useCallback(() => {
    setShowAll((previous) => !previous);
  }, []);

  const handleLinkPress = useCallback(
    (url: string) => {
      if (url && onBypassLinkPress) {
        onBypassLinkPress(url);
        return false;
      }

      return true;
    },
    [onBypassLinkPress]
  );

  return (
    <GalleryTouchableOpacity
      eventElementId={null}
      eventName={null}
      onPress={handlePress}
      disabled={numberOfLines === undefined || !touchToExpand}
    >
      <MarkdownDisplay
        onLinkPress={handleLinkPress}
        markdownit={markdownItOptions}
        rules={rules}
        style={mergedStyles}
      >
        {children}
      </MarkdownDisplay>
    </GalleryTouchableOpacity>
  );
}
