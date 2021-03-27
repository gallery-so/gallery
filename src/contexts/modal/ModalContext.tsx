import {
  ReactElement,
  ReactNode,
  createContext,
  useContext,
  memo,
  useState,
  useCallback,
  useMemo,
} from 'react';
import styled from 'styled-components';

type ModalActions = {
  showModal: (content: ReactElement) => void;
  hideModal: () => void;
};

const ModalContext = createContext<ModalActions | undefined>(undefined);

export const useModal = (): ModalActions => {
  const context = useContext(ModalContext);
  if (!context) {
    throw Error('Attempted to use ModalContext without a provider!');
  }
  return context;
};

type Props = { children: ReactNode };

function ModalProvider({ children }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [content, setContent] = useState<ReactElement | null>(null);

  const showModal = useCallback((providedContent) => {
    setIsOpen(true);
    setContent(providedContent);
  }, []);

  const hideModal = useCallback(() => {
    setIsOpen(false);
    setContent(null);
  }, []);

  const actions = useMemo(
    () => ({
      showModal,
      hideModal,
    }),
    [showModal, hideModal]
  );

  return (
    <ModalContext.Provider value={actions}>
      {children}
      {isOpen && (
        <>
          <Overlay onClick={hideModal} />
          <StyledContent>
            <StyledClose onClick={hideModal}>&#x2715;</StyledClose>
            {content}
          </StyledContent>
        </>
      )}
    </ModalContext.Provider>
  );
}

const Overlay = styled.div`
  top: 0;
  position: fixed;
  height: 100vh;
  width: 100vw;
  z-index: 1;
  background: white;
  opacity: 0.2;
`;

const StyledContent = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 2;

  padding: 40px;
  background: white;
`;

const StyledClose = styled.span`
  position: absolute;
  right: 10px;
  top: 10px;
  cursor: pointer;
`;

export default memo(ModalProvider);
