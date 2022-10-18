import { useStabilizedRouteTransitionKey } from 'components/FadeTransitioner/FadeTransitioner';
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
import { v4 as uuid } from 'uuid';
import useKeyDown from 'hooks/useKeyDown';
import { getScrollBarWidth } from 'utils/getScrollbarWidth';

type ModalState = {
  isModalOpenRef: MutableRefObject<boolean>;
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
  id?: string;
  content: ReactElement;
  headerText?: string;
  headerVariant?: ModalPaddingVariant;
  isFullPage?: boolean;
  isPaddingDisabled?: boolean;
  onClose?: () => void;
};

type HideModalFnProps = {
  id?: string;
  bypassOnClose?: boolean;
};

type ModalActions = {
  showModal: (s: ShowModalFnProps) => void;
  hideModal: (h?: HideModalFnProps) => void;
  clearAllModals: () => void;
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

type Modal = {
  id: string;
  isActive: boolean;
  content: ReactElement;
  headerText: string;
  headerVariant: ModalPaddingVariant;
  isFullPage: boolean;
  isPaddingDisabled: boolean;
  onClose: () => void;
};

function ModalProvider({ children }: Props) {
  const [modals, setModals] = useState<Modal[]>([]);

  // used when needed to prevent race conditions within side-effects that look up this state
  const isModalOpenRef = useRef(false);
  useEffect(() => {
    isModalOpenRef.current = Boolean(modals.length);
  }, [modals.length]);

  const state = useMemo(() => ({ isModalOpenRef }), [isModalOpenRef]);

  const showModal = useCallback(
    ({
      id = uuid(),
      content,
      headerText = '',
      headerVariant = 'standard',
      isFullPage = false,
      isPaddingDisabled = false,
      onClose = noop,
    }: ShowModalFnProps) => {
      setModals((prevModals) => [
        ...prevModals,
        {
          id,
          isActive: true,
          content,
          headerText,
          headerVariant,
          isFullPage,
          isPaddingDisabled,
          onClose,
        },
      ]);
    },
    []
  );

  /**
   * consumer can choose to close a specific modal by ID. otherwise, we'll pop
   * the latest modal off the stack.
   *
   * note that this function doesn't literally remove the modal from the array;
   * it simply marks the specified modal as `isActive: false`. the child modal
   * then takes this information to kick off an animation, and removes the modal
   * later on.
   */
  const hideModal = useCallback((props = {} as HideModalFnProps) => {
    const { id: modalId, bypassOnClose = false } = props;

    setModals((prev) => {
      const modalToDismiss = modalId
        ? prev.find(({ id }) => id === modalId)
        : prev[prev.length - 1];

      if (!bypassOnClose) {
        modalToDismiss?.onClose();
      }

      return prev.map((modal) => {
        if (modal.id === modalToDismiss?.id) {
          return {
            ...modal,
            isActive: false,
          };
        }
        return modal;
      });
    });
  }, []);

  const dismountModal = useCallback((modalId) => {
    setModals((prev) => prev.filter(({ id }) => id !== modalId));
  }, []);

  const clearAllModals = useCallback(() => setModals([]), []);

  const actions = useMemo(
    () => ({
      showModal,
      hideModal,
      clearAllModals,
    }),
    [showModal, hideModal, clearAllModals]
  );

  /**
   * EFFECT: Close modal on route change
   */
  const route = useStabilizedRouteTransitionKey();
  useEffect(() => {
    if (isModalOpenRef.current) {
      // bypass onClose as to not navigate the user back mid-route change
      hideModal({ bypassOnClose: true });
    }
  }, [route, hideModal]);

  /**
   * EFFECT: Prevent main body from being scrollable while any modals are open
   */
  useEffect(() => {
    const modalShowing = modals.length > 0;
    const currentScrollbarWidth = getScrollBarWidth();

    document.body.style.overflow = modalShowing ? 'hidden' : 'unset';

    /**
     * This section is to avoid layout shift when the scrollbar potentially disappears.
     *
     * If there's a scrollbar active on the body, we'll temporarily shift everything
     * to the left by the scrollbar width to keep the layout consistent with
     * where it was prior to the scrollbar disappearing
     */
    document.body.style.paddingRight = modalShowing ? `${currentScrollbarWidth}px` : 'unset';

    const globalNavbar = document.querySelector('.GlobalNavbar') as HTMLElement | null;
    if (globalNavbar) {
      /**
       * Commenting this out to prevent a regression on the banner width not extending to 100%.
       * Leaving the code in tho in case scrollbar issue comes back
       */
      globalNavbar.style.transform = modalShowing ? 'translateX(0px)' : 'unset';
      globalNavbar.style.width = modalShowing ? `calc(100vw - ${currentScrollbarWidth}px)` : '100%';
    }
  }, [modals.length]);

  /**
   * EFFECT: Hide all modals if user clicks Back
   */
  useEffect(() => {
    function handlePopState() {
      clearAllModals();
    }
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [clearAllModals]);

  /**
   * EFFECT: Pop one modal if user hits Escape key
   *
   * TODO: below logic may be fixed via stopPropagation
   * this is wrapped in a setTimeout so that any event that triggers showModal
   * via escape does not cause jitter. e.g. CollectionEditor.tsx opens the modal
   * via escape, so trying to close here would jitter an open/close rapidly
   */
  const delayedHideModal = useCallback(() => {
    setTimeout(hideModal, 150);
  }, [hideModal]);
  useKeyDown('Escape', delayedHideModal);

  return (
    <ModalStateContext.Provider value={state}>
      <ModalActionsContext.Provider value={actions}>
        {children}
        {modals.map(
          ({ id, isActive, content, headerText, headerVariant, isFullPage, isPaddingDisabled }) => {
            return (
              <AnimatedModal
                key={id}
                isActive={isActive}
                hideModal={hideModal}
                dismountModal={() => dismountModal(id)}
                content={content}
                headerText={headerText}
                isFullPage={isFullPage}
                isPaddingDisabled={isPaddingDisabled}
                headerVariant={headerVariant}
              />
            );
          }
        )}
      </ModalActionsContext.Provider>
    </ModalStateContext.Provider>
  );
}

export default memo(ModalProvider);
