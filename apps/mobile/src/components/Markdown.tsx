import { PropsWithChildren, useMemo } from 'react';
import { StyleProp, StyleSheet } from 'react-native';
import MarkdownDisplay, { MarkdownIt, MarkdownProps } from 'react-native-markdown-display';
import NamedStyles = StyleSheet.NamedStyles;

const markdownStyles = StyleSheet.create({
  paragraph: {
    marginTop: 0,
    marginBottom: 0,
  },
  body: {
    fontSize: 12,
    color: '#141414',
    fontFamily: 'ABCDiatypeRegular',
  },
  link: {
    color: '#707070',
  },
});

type GalleryMarkdownProps = PropsWithChildren<{
  style?: StyleProp<unknown>;
}>;

export function Markdown({ children, style }: GalleryMarkdownProps) {
  const mergedStyles = useMemo(() => {
    return StyleSheet.flatten([markdownStyles, style]) as NamedStyles<MarkdownProps>;
  }, [style]);

  return (
    <MarkdownDisplay markdownit={MarkdownIt({ typographer: true })} style={mergedStyles}>
      {children}
    </MarkdownDisplay>
  );
}
