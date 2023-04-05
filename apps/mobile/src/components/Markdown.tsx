import { PropsWithChildren, useMemo } from 'react';
import { StyleSheet } from 'react-native';
import MarkdownDisplay, { MarkdownIt, MarkdownProps } from 'react-native-markdown-display';

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
  strong: {
    fontFamily: 'ABCDiatypeBold',
  },
  link: {
    color: '#707070',
  },
});

type GalleryMarkdownProps = PropsWithChildren<{
  rules?: MarkdownProps['rules'];
  style?: MarkdownProps['style'];
}>;

export function Markdown({ children, rules, style }: GalleryMarkdownProps) {
  const mergedStyles = useMemo(() => {
    return { ...markdownStyles, ...style };
  }, [style]);

  return (
    <MarkdownDisplay
      markdownit={MarkdownIt({ typographer: true })}
      style={mergedStyles}
      rules={rules}
    >
      {children}
    </MarkdownDisplay>
  );
}
