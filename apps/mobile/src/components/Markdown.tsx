import { PropsWithChildren, useCallback, useMemo, useState } from 'react';
import { StyleProp, StyleSheet, Text, TouchableOpacity, useColorScheme } from 'react-native';
import MarkdownDisplay, {
  MarkdownIt,
  MarkdownProps,
  RenderRules,
} from 'react-native-markdown-display';
import NamedStyles = StyleSheet.NamedStyles;
import colors from '~/shared/theme/colors';

const markdownStyles = StyleSheet.create({
  paragraph: {
    marginTop: 0,
    marginBottom: 0,
  },
  body: {
    fontSize: 14,
    color: colors.offBlack,
    fontFamily: 'ABCDiatypeRegular',
  },
  link: {
    color: '#707070',
  },
});

const darkModeMarkdownStyles = StyleSheet.create({
  body: {
    color: colors.offWhite,
  },
});

type GalleryMarkdownProps = PropsWithChildren<{
  numberOfLines?: number;
  touchToExpand?: boolean;
  style?: StyleProp<unknown>;
}>;

const markdownItOptions = MarkdownIt({ typographer: true, linkify: false });

export function Markdown({
  children,
  touchToExpand = false,
  numberOfLines,
  style,
}: GalleryMarkdownProps) {
  const [showAll, setShowAll] = useState(false);
  const colorScheme = useColorScheme();

  const mergedStyles = useMemo(() => {
    return StyleSheet.flatten([
      markdownStyles,
      style,
      colorScheme === 'dark' ? darkModeMarkdownStyles : undefined,
    ]) as NamedStyles<MarkdownProps>;
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
    }

    return rules;
  }, [numberOfLines, showAll]);

  const handlePress = useCallback(() => {
    setShowAll((previous) => !previous);
  }, []);

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={numberOfLines === undefined || !touchToExpand}
    >
      <MarkdownDisplay markdownit={markdownItOptions} rules={rules} style={mergedStyles}>
        {children}
      </MarkdownDisplay>
    </TouchableOpacity>
  );
}
