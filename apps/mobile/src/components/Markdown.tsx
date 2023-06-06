import merge from 'lodash.merge';
import { useColorScheme } from 'nativewind';
import { PropsWithChildren, useCallback, useMemo, useState } from 'react';
import { StyleProp, Text } from 'react-native';
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
  link: {
    color: '#707070',
  },
};

const darkModeMarkdownStyles = {
  body: {
    color: colors.offWhite,
  },
};

const lightModeMarkdownStyles = {
  body: {
    color: colors.offBlack,
  },
};

type GalleryMarkdownProps = PropsWithChildren<{
  numberOfLines?: number;
  touchToExpand?: boolean;
  style?: StyleProp<unknown>;
}>;

const markdownItOptions = MarkdownIt({ typographer: true, linkify: false }).disable(['lheading']);

export function Markdown({
  children,
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
    }

    return rules;
  }, [numberOfLines, showAll]);

  const handlePress = useCallback(() => {
    setShowAll((previous) => !previous);
  }, []);

  return (
    <GalleryTouchableOpacity
      eventElementId={null}
      eventName={null}
      onPress={handlePress}
      disabled={numberOfLines === undefined || !touchToExpand}
    >
      <MarkdownDisplay markdownit={markdownItOptions} rules={rules} style={mergedStyles}>
        {children}
      </MarkdownDisplay>
    </GalleryTouchableOpacity>
  );
}
