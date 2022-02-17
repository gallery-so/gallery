import ReactMarkdown from 'react-markdown';
import styled from 'styled-components';
import GalleryLink from '../GalleryLink/GalleryLink';
import { Heading } from '../Text/Text';

type Props = {
  text: string;
};

// Strict Markdown component for rendering user-provided content because we want to limit the allowed elements. To be used as the default markdown parser in our app
export default function Markdown({ text }: Props) {
  return (
    <BaseMarkdown allowedElements={['a', 'strong', 'em', 'ol', 'ul', 'li', 'p']} text={text} />
  );
}

// Markdown component for rendering Gallery-provided content that allow a wider range of elements
export function InternalMarkdown({ text }: Props) {
  return (
    <BaseMarkdown
      allowedElements={['a', 'strong', 'em', 'ol', 'ul', 'li', 'p', 'h1', 'h2', 'h3', 'br']}
      text={text}
    />
  );
}

type BaseProps = {
  text: string;
  allowedElements: string[];
};

function BaseMarkdown({ text, allowedElements }: BaseProps) {
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
        h3: ({ children }) => <StyledBodyHeading>{children}</StyledBodyHeading>,
      }}
      allowedElements={allowedElements}
      unwrapDisallowed
    >
      {text}
    </ReactMarkdown>
  );
}

const StyledBodyHeading = styled(Heading)`
  margin: 32px 0 16px;
`;
