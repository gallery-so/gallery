import { ANIMATED_COMPONENT_TRANSITION_MS } from 'components/core/transitions';
import { useStabilizedRouteTransitionKey } from 'components/FadeTransitioner/FadeTransitioner';
import { useIsMobileOrMobileLargeWindowWidth } from 'hooks/useWindowSize';
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
  MutableRefObject,
  useEffect,
} from 'react';
import noop from 'utils/noop';
import AnimatedModal from './AnimatedModal';
import { ModalPaddingVariant } from './constants';

type ModalState = {
  isModalOpenRef: MutableRefObject<boolean>;
  isModalMounted: boolean;
};

const ModalStateContext = createContext<ModalState | undefined>(undefined);

export const useModalState = (): ModalState => {
  const context = useContext(ModalStateContext);
  if (!context) {
    throw new Error('Attempted to use ModalStateContext without a provider!');
  }

  return context;
};

type ShowModalFnProps = {
  content: ReactElement;
  headerText?: string;
  headerVariant?: ModalPaddingVariant;
  onClose?: () => void;
  isFullPage?: boolean;
  isPaddingDisabled?: boolean;
};

type ModalActions = {
  showModal: ({ content, onClose, isFullPage }: ShowModalFnProps) => void;
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
  // ref version of the above. used when needed to prevent race
  // conditions within side-effects that look up this state
  const isModalOpenRef = useRef(false);
  // Whether the modal should take up the entire page.
  const [isFullPage, setIsFullPage] = useState<boolean>(false);
  // Whether to disable default padding
  const [isPaddingDisabled, setIsPaddingDisabled] = useState<boolean>(false);
  // Header text
  const [headerText, setHeaderText] = useState('');
  // Header variant
  const [headerVariant, setHeaderVariant] = useState<ModalPaddingVariant>('standard');
  // Content to be displayed within the modal
  const [content, setContent] = useState<ReactElement | null>(null);
  // Callback to trigger when the modal is closed
  const onCloseRef = useRef(noop);

  const state = useMemo(
    () => ({ isModalOpenRef, isModalMounted: isMounted }),
    [isModalOpenRef, isMounted]
  );

  const isMobile = useIsMobileOrMobileLargeWindowWidth();

  const showModal = useCallback(
    ({
      content,
      headerText = '',
      headerVariant = 'standard',
      onClose = noop,
      isFullPage = false,
      isPaddingDisabled = false,
    }) => {
      setIsActive(true);
      setHeaderText(headerText);
      setHeaderVariant(headerVariant);
      isModalOpenRef.current = true;
      setIsMounted(true);
      setIsFullPage(isFullPage);
      setIsPaddingDisabled(isPaddingDisabled);
      setContent(content);
      onCloseRef.current = onClose;

      // prevent main body from being scrollable while the modal is open.
      document.body.style.overflow = 'hidden';
    },
    []
  );

  // Trigger fade-out that takes X seconds
  // schedule unmount in X seconds
  const hideModal = useCallback((bypassOnClose = false) => {
    setIsActive(false);
    isModalOpenRef.current = false;
    // need to explicitly check for true, because if this function
    // is passed into an onClick, it'll be given a truthy MouseEvent
    if (bypassOnClose !== true) {
      onCloseRef.current?.();
    }
    setTimeout(() => {
      setIsMounted(false);
      setContent(null);
      setHeaderText('');
      setHeaderVariant('standard');
      setIsFullPage(false);
      setIsPaddingDisabled(false);
      onCloseRef.current = noop;

      // enable scrolling again
      document.body.style.overflow = 'unset';

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

  // close modal on route change
  const route = useStabilizedRouteTransitionKey();
  useEffect(() => {
    if (isModalOpenRef.current) {
      // bypass onClose as to not navigate the user back mid-route change
      hideModal(true);
    }
  }, [route, hideModal]);

  return (
    <ModalStateContext.Provider value={state}>
      <ModalActionsContext.Provider value={actions}>
        {children}
        {isMounted && content && (
          <AnimatedModal
            isActive={isActive}
            hideModal={hideModal}
            content={content}
            headerText={headerText}
            isFullPage={isFullPage}
            isMobile={isMobile}
            isPaddingDisabled={isPaddingDisabled}
            headerVariant={headerVariant}
          />
        )}
      </ModalActionsContext.Provider>
    </ModalStateContext.Provider>
  );
}

export default memo(ModalProvider);
