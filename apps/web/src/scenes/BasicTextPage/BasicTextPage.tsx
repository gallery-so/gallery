import styled from 'styled-components';

import { InternalMarkdown } from '~/components/core/Markdown/Markdown';
import { VStack } from '~/components/core/Spacer/Stack';
import { TitleL } from '~/components/core/Text/Text';

type Props = {
  title: string;
  body: string;
};

// Use this component to render a basic text page with a title and body, using the Gallery style
export default function BasicTextPage({ title, body }: Props) {
  return (
    <StyledPage>
      <StyledContent gap={64}>
        <TitleL>{title}</TitleL>
        <StyledBody>
          <InternalMarkdown text={body} eventContext={null} />
        </StyledBody>
      </StyledContent>
    </StyledPage>
  );
}

const StyledPage = styled.div`
  padding: 200px 40px;
  display: flex;
  justify-content: center;
  align-items: center;
`;

// Apply a generalized version of Gallery's style to the body text
const StyledContent = styled(VStack)`
  max-width: 800px;
  font-family: 'ABC Diatype', Helvetica, Arial, sans-serif;
  font-size: 14px;
  line-height: 24px;

  ul {
    display: flex;
    flex-direction: column;
    margin: 8px 0;
    padding-left: 24px;
  }

  li {
    margin-bottom: 8px;
  }

  h2 {
    margin: 24px 0 16px;
  }

  strong {
    font-weight: 500;
  }

  p {
    white-space: pre-wrap;
  }
`;

const StyledBody = styled.div`
  display: flex;
  flex-direction: column;
`;
