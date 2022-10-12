import Markdown from 'components/core/Markdown/Markdown';
import { VStack } from 'components/core/Spacer/Stack';
import { BaseM, BaseXL } from 'components/core/Text/Text';
import styled from 'styled-components';

type Props = {
  title: string;
  description: string;
  children?: React.ReactNode;
  isEditor?: boolean;
};

export function EmptyState({ title, description, children, isEditor }: Props) {
  return (
    <VStack align={isEditor ? 'center' : 'baseline'}>
      <StyledTitle>{title}</StyledTitle>
      <StyledBody isEditor={isEditor}>
        <Markdown text={description} />
      </StyledBody>
      {children}
    </VStack>
  );
}

const StyledTitle = styled(BaseXL)`
  font-weight: 700;
`;

const StyledBody = styled(BaseM)<{ isEditor?: boolean }>`
  white-space: pre-wrap;
  ${({ isEditor }) => isEditor && 'text-align: center;'}
`;
