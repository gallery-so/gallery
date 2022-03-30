import { InternalMarkdown } from 'components/core/Markdown/Markdown';
import Page from 'components/core/Page/Page';
import Spacer from 'components/core/Spacer/Spacer';
import { TitleL } from 'components/core/Text/Text';
import styled from 'styled-components';

type Props = {
  title: string;
  body: string;
};

// Use this component to render a basic text page with a title and body, using the Gallery style
export default function BasicTextPage({ title, body }: Props) {
  return (
    <StyledPage>
      <StyledContent>
        <TitleL>{title}</TitleL>
        <Spacer height={64} />
        <StyledBody>
          <InternalMarkdown text={body} />
        </StyledBody>
      </StyledContent>
    </StyledPage>
  );
}

const StyledPage = styled(Page)`
  padding: 120px 40px;
  display: flex;
  align-items: center;
`;

// Apply a generalized version of Gallery's style to the body text
const StyledContent = styled.div`
  max-width: 800px;
  font-family: 'Helvetica Neue';
  font-size: 14px;
  line-height: 24px;
  letter-spacing: 0.4px;

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
