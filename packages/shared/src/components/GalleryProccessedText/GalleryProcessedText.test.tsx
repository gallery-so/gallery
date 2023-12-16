import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

import GalleryProcessedText from './GalleryProcessedText';
import { RelayEnvironmentProvider } from 'react-relay';
import { createMockEnvironment } from 'relay-test-utils';

const environment = createMockEnvironment();

const renderWithRelay = (node: React.ReactNode) => {
  return render(
    <RelayEnvironmentProvider environment={environment}>{node}</RelayEnvironmentProvider>
  );
};

describe('<GalleryProcessedText />', () => {
  // const mockMentions: GalleryProcessedTextFragment$key[] = [];

  const MockTextComponent = ({ children }: { children: React.ReactNode }) => (
    <span>{children}</span>
  );
  const MockLinkComponent = ({ url, value }: { url: string; value?: string }) => (
    <a href={url}>{value ?? url}</a>
  );
  const MockMentionComponent = ({ mention }: { mention: string }) => <span>@{mention}</span>;
  const MockBreakComponent = () => <br />;

  it('renders text correctly', () => {
    const { getByText } = renderWithRelay(
      <GalleryProcessedText
        text="Hello World"
        TextComponent={MockTextComponent}
        LinkComponent={MockLinkComponent}
        MentionComponent={MockMentionComponent}
        BreakComponent={MockBreakComponent}
      />
    );

    expect(getByText('Hello World')).toBeInTheDocument();
  });

  it('renders markdown links correctly', () => {
    const { getByText } = renderWithRelay(
      <GalleryProcessedText
        text="This is a [link](http://example.com)"
        TextComponent={MockTextComponent}
        LinkComponent={MockLinkComponent}
        MentionComponent={MockMentionComponent}
        BreakComponent={MockBreakComponent}
      />
    );

    expect(getByText('link').closest('a')).toHaveAttribute('href', 'http://example.com');
  });

  it('renders plain links correctly', () => {
    const { getByText } = renderWithRelay(
      <GalleryProcessedText
        text="This is a http://example.com"
        TextComponent={MockTextComponent}
        LinkComponent={MockLinkComponent}
        MentionComponent={MockMentionComponent}
        BreakComponent={MockBreakComponent}
      />
    );

    expect(getByText('http://example.com').closest('a')).toHaveAttribute(
      'href',
      'http://example.com'
    );
  });

  // TODO: Fix mentions test
  // it('renders mentions correctly', () => {
  //   const { getByText } = renderWithRelay(
  //     <GalleryProcessedText
  //       text="This is a @mention"
  //       TextComponent={MockTextComponent}
  //       LinkComponent={MockLinkComponent}
  //       MentionComponent={MockMentionComponent}
  //       BreakComponent={MockBreakComponent}
  //       mentionsRef={mockMentions}
  //     />
  //   );

  //   expect(getByText('@mention')).toBeInTheDocument();
  // });
});
