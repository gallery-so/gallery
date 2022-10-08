import { ReactNode } from 'react';
import styled from 'styled-components';
import { FOOTER_HEIGHT } from 'flows/shared/components/WizardFooter/constants';

type Props = {
  children: ReactNode | ReactNode[];
  // If this is true, the page height will be reduced to account for the footer height
  withFooter?: boolean;
};

/**
 * A helper component to easily generate full-page steps where the content is centered
 */
export default function FullPageCenteredStep({ children, withFooter }: Props) {
  return <StyledPage withFooter={withFooter}>{children}</StyledPage>;
}

const StyledPage = styled.div<{ withFooter?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: calc(100vh - ${({ withFooter }) => (withFooter ? FOOTER_HEIGHT : 0)}px);
`;
