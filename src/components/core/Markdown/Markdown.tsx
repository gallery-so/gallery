import ReactMarkdown from 'react-markdown';
import GalleryLink from '../GalleryLink/GalleryLink';
import remarkTwemoji from 'remark-twemoji';

type Props = {
  text: string;
};

export default function Markdown({ text }: Props) {
  return (
    <ReactMarkdown
      components={{
        a: ({ href, children }) =>
          href ? (
            <GalleryLink href={href}>{children}</GalleryLink>
          ) : (
            // if href is blank, we must render the empty string this way;
            // simply rendering `children` causes the markdown library to crash
            // eslint-disable-next-line react/jsx-no-useless-fragment
            <>{children}</>
          ),
      }}
      allowedElements={['a', 'strong', 'em', 'ol', 'ul', 'li', 'p']}
      unwrapDisallowed
      remarkPlugins={[[remarkTwemoji, { isReact: true }]]}
    >
      {text}
    </ReactMarkdown>
  );
}
