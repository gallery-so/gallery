import ReactMarkdown from 'react-markdown';
import GalleryLink from '../GalleryLink/GalleryLink';

type Props = {
  text: string;
};

export default function Markdown({ text }: Props) {
  return (
    <ReactMarkdown
      components={{
        // TODO: come up with a sane default if NFT doesn't have an href provided
        a: ({ href, children }) => <GalleryLink href={href ?? window.location.origin} children={children} />,
      }}
    >
      {text}
    </ReactMarkdown>
  );
}
