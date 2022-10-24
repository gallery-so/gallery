import Markdown from 'components/core/Markdown/Markdown';
import { VStack } from 'components/core/Spacer/Stack';
import { BaseM, BaseXL } from 'components/core/Text/Text';
import styled from 'styled-components';

type Props = {
  title: string;
  description?: string;
  children?: React.ReactNode;
};

export function EmptyState({ title, description, children }: Props) {
  return (
    <VStack align="center" gap={12}>
      <VStack align="center">
        <StyledTitle>{title}</StyledTitle>
        {description && (
          <StyledBody>
            <Markdown text={description} />
          </StyledBody>
        )}
      </VStack>
      {children}
    </VStack>
  );
}

const StyledTitle = styled(BaseXL)`
  font-weight: 700;
`;

const StyledBody = styled(BaseM)`
  white-space: pre-wrap;
  text-align: center;
`;
