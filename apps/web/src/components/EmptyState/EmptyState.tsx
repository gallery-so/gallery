import styled from 'styled-components';

import Markdown from '~/components/core/Markdown/Markdown';
import { VStack } from '~/components/core/Spacer/Stack';
import { BaseM, BaseXL } from '~/components/core/Text/Text';

type Props = {
  title: string;
  description?: string;
  children?: React.ReactNode;
};

export function EmptyState({ title, description, children }: Props) {
  return (
    <VStack align="center" gap={12}>
      {title || description ? (
        <VStack align="center">
          <StyledTitle>{title}</StyledTitle>
          {description && (
            <StyledBody>
              <Markdown text={description} eventContext={null} />
            </StyledBody>
          )}
        </VStack>
      ) : null}
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
