import { PropsWithChildren, useCallback, useMemo, useState } from 'react';
import { StyleProp, StyleSheet, Text, TouchableOpacity } from 'react-native';
import MarkdownDisplay, {
  MarkdownIt,
  MarkdownProps,
  RenderRules,
} from 'react-native-markdown-display';
import NamedStyles = StyleSheet.NamedStyles;

const markdownStyles = StyleSheet.create({
  paragraph: {
    marginTop: 0,
    marginBottom: 0,
  },
  body: {
    fontSize: 14,
    color: '#141414',
    fontFamily: 'ABCDiatypeRegular',
  },
  link: {
    color: '#707070',
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

  const mergedStyles = useMemo(() => {
    return StyleSheet.flatten([markdownStyles, style]) as NamedStyles<MarkdownProps>;
  }, [style]);

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
