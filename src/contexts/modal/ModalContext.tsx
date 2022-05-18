import { ANIMATED_COMPONENT_TRANSITION_MS } from 'components/core/transitions';
import {
  ReactElement,
  ReactNode,
  createContext,
  useContext,
  memo,
  useState,
  useCallback,
  useMemo,
  useRef,
} from 'react';
import noop from 'utils/noop';
import AnimatedModal from './AnimatedModal';

type ModalState = {
  isActive: boolean;
};

const ModalStateContext = createContext<ModalState | undefined>(undefined);

export const useModalState = (): ModalState => {
  const context = useContext(ModalStateContext);
  if (!context) {
    throw new Error('Attempted to use ModalStateContext without a provider!');
  }

  return context;
};

type ModalActions = {
  showModal: (content: ReactElement, onClose?: () => void, isFullPage?: boolean) => void;
  hideModal: () => void;
};

const ModalActionsContext = createContext<ModalActions | undefined>(undefined);

export const useModalActions = (): ModalActions => {
  const context = useContext(ModalActionsContext);
  if (!context) {
    throw new Error('Attempted to use ModalActionsContext without a provider!');
  }

  return context;
};

type Props = { children: ReactNode };

function ModalProvider({ children }: Props) {
  // Whether node is actually on the DOM
  const [isMounted, setIsMounted] = useState(false);
  // Pseudo-state for signaling animations. this will allow us
  // to display an animation prior to unmounting
  const [isActive, setIsActive] = useState(false);
  // Whether the modal should take up the entire page
  const [isFullPage, setIsFullPage] = useState(false);
  // Content to be displayed within the modal
  const [content, setContent] = useState<ReactElement | null>(null);
  // Callback to trigger when the modal is closed
  const onCloseRef = useRef(noop);

  const state = useMemo(() => ({ isActive }), [isActive]);

  const showModal = useCallback((providedContent, onClose = noop, isFullPage = false) => {
    setIsActive(true);
    setIsMounted(true);
    setIsFullPage(isFullPage);
    setContent(providedContent);
    onCloseRef.current = onClose;
  }, []);

  // Trigger fade-out that takes X seconds
  // schedule unmount in X seconds
  const hideModal = useCallback(() => {
    setIsActive(false);
    onCloseRef.current?.();
    setTimeout(() => {
      setIsMounted(false);
      setContent(null);
      setIsFullPage(false);
      onCloseRef.current = noop;
      // Unmount a bit sooner to avoid race condition of
      // elements flashing before they're removed from view
    }, ANIMATED_COMPONENT_TRANSITION_MS - 30);
  }, []);

  const actions = useMemo(
    () => ({
      showModal,
      hideModal,
    }),
    [showModal, hideModal]
  );

  return (
    <ModalStateContext.Provider value={state}>
      <ModalActionsContext.Provider value={actions}>
        {children}
        {isMounted && content && (
          <AnimatedModal
            isActive={isActive}
            hideModal={hideModal}
            content={content}
            isFullPage={isFullPage}
          />
        )}
      </ModalActionsContext.Provider>
    </ModalStateContext.Provider>
  );
}

export default memo(ModalProvider);
