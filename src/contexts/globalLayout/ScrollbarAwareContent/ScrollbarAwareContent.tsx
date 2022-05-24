import { useModalState } from 'contexts/modal/ModalContext';
import { ReactNode } from 'react';
import styled from 'styled-components';

type Props = {
  children: ReactNode;
};

/**
 * addresses element shifting jank when a modal is opened and the scrollbar is removed.
 * while most of this is covered in `ModalContext`, this component handles special cases
 * such as children of content that is position:fixed.
 */
const ScrollbarAwareContent = ({ children }: Props) => {
  const { isModalMounted } = useModalState();
  return (
    <StyledScrollbarAwareContent artificialPadding={isModalMounted}>
      {children}
    </StyledScrollbarAwareContent>
  );
};

// also defined in `index.css`
export const SCROLLBAR_WIDTH_PX = 6;

const StyledScrollbarAwareContent = styled.div<{ artificialPadding: boolean }>`
  transform: ${({ artificialPadding }) =>
    `translate(${artificialPadding ? -SCROLLBAR_WIDTH_PX : 0}px)`};
`;

export default ScrollbarAwareContent;
