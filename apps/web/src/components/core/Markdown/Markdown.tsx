import { PropsWithChildren } from 'react';
import ReactMarkdown from 'react-markdown';
import styled from 'styled-components';

import { GalleryElementTrackingProps } from '~/shared/contexts/AnalyticsContext';

import GalleryLink, { GalleryLinkNeedsVerification } from '../GalleryLink/GalleryLink';
import { BaseXL } from '../Text/Text';

type PublicProps = {
  text: string;
  inheritLinkStyling?: boolean;
  CustomInternalLinkComponent?: React.FunctionComponent<PropsWithChildren<{ href: string }>>;
  eventContext: GalleryElementTrackingProps['eventContext'];
};

// Strict Markdown component for rendering user-provided content because we want to limit the allowed elements. To be used as the default markdown parser in our app
export default function Markdown(props: PublicProps) {
  return <BaseMarkdown allowedElements={['a', 'strong', 'em', 'ol', 'ul', 'li', 'p']} {...props} />;
}

// Markdown component for rendering Gallery-provided content that allow a wider range of elements
export function InternalMarkdown(props: PublicProps) {
  return (
    <BaseMarkdown
      allowedElements={['a', 'strong', 'em', 'ol', 'ul', 'li', 'p', 'h1', 'h2', 'h3', 'br']}
      {...props}
    />
  );
}

type BaseProps = {
  allowedElements: string[];
} & PublicProps;

function BaseMarkdown({
  text,
  CustomInternalLinkComponent,
  allowedElements,
  inheritLinkStyling = false,
  eventContext,
}: BaseProps) {
  return (
    <ReactMarkdown
      components={{
        a: ({ href, children }) => {
          if (href) {
            const isInternalLink = href.startsWith('https://gallery.so/');
            if (isInternalLink && CustomInternalLinkComponent) {
              return (
                <CustomInternalLinkComponent href={href}>{children}</CustomInternalLinkComponent>
              );
            }
            if (isInternalLink) {
              return (
                <GalleryLink
                  inheritLinkStyling={inheritLinkStyling}
                  // @ts-expect-error convert to an internal redirect. typescript complains because
                  // this is a dynamic route that we haven't explicitly defined
                  to={{ pathname: href.replace('https://gallery.so', '') }}
                  eventElementId="Markdown Link"
                  eventName="Markdown Link Click"
                  eventContext={eventContext}
                >
                  {children}
                </GalleryLink>
              );
            }
            return (
              <GalleryLinkNeedsVerification inheritLinkStyling={inheritLinkStyling} href={href}>
                {children}
              </GalleryLinkNeedsVerification>
            );
          }
          // if href is blank, we must render the empty string this way;
          // simply rendering `children` causes the markdown library to crash
          // eslint-disable-next-line react/jsx-no-useless-fragment
          return <>{children}</>;
        },
        h3: ({ children }) => <StyledBodyHeading>{children}</StyledBodyHeading>,
        ul: ({ children }) => <StyledUl>{children}</StyledUl>,
        p: ({ children }) => <StyledP>{children}</StyledP>,
      }}
      allowedElements={allowedElements}
      unwrapDisallowed
    >
      {text}
    </ReactMarkdown>
  );
}

const StyledBodyHeading = styled(BaseXL)`
  margin: 32px 0 16px;
`;

const StyledUl = styled.ul`
  padding-inline-start: 24px;
  margin: 0;
  white-space: normal;
`;

const StyledP = styled.p`
  white-space: pre-line;
  padding-bottom: 12px;
  &:last-child {
    padding-bottom: 0px;
  }
`;
