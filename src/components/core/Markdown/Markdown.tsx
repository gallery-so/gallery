import ReactMarkdown from 'react-markdown';
import GalleryLink from '../GalleryLink/GalleryLink';
import MarkdownToJSX from 'markdown-to-jsx';
import React from 'react';

const ALLOWED_TAGS = ['a', 'strong', 'em', 'ol', 'ul', 'li', 'p', 'Emoji'];

function createElement(type: any, props?: React.Attributes | null, children?: React.ReactNode) {
  return typeof type === 'string' && ALLOWED_TAGS.includes(type)
    ? React.createElement(type, props, children)
    : (React.createElement(React.Fragment, { key: props?.key }, children) as any);
}

type Props = {
  text: string;
};

export default function Markdown({ text }: Props) {
  return (
    <MarkdownToJSX
      options={{
        // createElement,
        overrides: {
          Emoji: { component: (props: any) => <>hello</> },
        },
      }}
      // components={{
      //   a: ({ href, children }) =>
      //     href ? (
      //       <GalleryLink href={href}>{children}</GalleryLink>
      //     ) : (
      //       // if href is blank, we must render the empty string this way;
      //       // simply rendering `children` causes the markdown library to crash
      //       // eslint-disable-next-line react/jsx-no-useless-fragment
      //       <>{children}</>
      //     ),
      // }}
      // allowedElements={['a', 'strong', 'em', 'ol', 'ul', 'li', 'p']}
      // unwrapDisallowed
    >
      {text}
    </MarkdownToJSX>
  );
}
