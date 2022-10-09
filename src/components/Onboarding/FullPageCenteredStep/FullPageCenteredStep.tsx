import { ReactNode } from 'react';
import styled from 'styled-components';
import { FOOTER_HEIGHT } from 'components/Onboarding/constants';
import GalleryRoute from 'scenes/_Router/GalleryRoute';

type Props = {
  children: ReactNode | ReactNode[];
  // If this is true, the page height will be reduced to account for the footer height
  withFooter?: boolean;
};

/**
 * A helper component to easily generate full-page steps where the content is centered
 */
export default function FullPageCenteredStep({ children, withFooter }: Props) {
  return (
    <GalleryRoute
      element={<StyledPage withFooter={withFooter}>{children}</StyledPage>}
      navbar={false}
      banner={false}
      footer={false}
    />
  );
}

const StyledPage = styled.div<{ withFooter?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: calc(100vh - ${({ withFooter }) => (withFooter ? FOOTER_HEIGHT : 0)}px);
`;
