import { PropsWithChildren } from 'react';
import { StyleSheet } from 'react-native';
import MarkdownDisplay, { MarkdownIt } from 'react-native-markdown-display';

const markdownStyles = StyleSheet.create({
  body: {
    fontSize: 12,
    color: '#141414',
    fontFamily: 'ABCDiatypeRegular',
  },
  link: {
    color: '#707070',
  },
});

export function Markdown({ children }: PropsWithChildren) {
  return (
    <MarkdownDisplay markdownit={MarkdownIt({ typographer: true })} style={markdownStyles}>
      {children}
    </MarkdownDisplay>
  );
}
