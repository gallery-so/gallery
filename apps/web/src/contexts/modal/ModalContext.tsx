import {
  createContext,
  memo,
  MutableRefObject,
  ReactElement,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { v4 as uuid } from 'uuid';

import useKeyDown from '~/hooks/useKeyDown';
import { noop } from '~/shared/utils/noop';
import { getScrollBarWidth } from '~/utils/getScrollbarWidth';

import useStabilizedRouteTransitionKey from '../globalLayout/useStabilizedRouteTransitionKey';
import AnimatedModal, { AnimatedModalProps } from './AnimatedModal';
import { ModalPaddingVariant } from './constants';

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
  headerElement?: JSX.Element | false;
  headerText?: string;
  headerVariant?: ModalPaddingVariant;
  isFullPage?: boolean;
  hideClose?: boolean;
  isPaddingDisabled?: boolean;
  onClose?: () => void;
  onCloseOverride?: AnimatedModalProps['onCloseOverride'];
};

type HideModalFnProps = {
  id?: string;
  bypassOnClose?: boolean;
};

type ModalActions = {
  showModal: (s: ShowModalFnProps) => void;
  hideModal: (h?: HideModalFnProps) => void;
  clearAllModals: () => void;
  setHeaderElement: (id: string, s: ShowModalFnProps['headerElement']) => void;
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
  onClose: () => void;
} & Omit<AnimatedModalProps, 'hideModal' | 'dismountModal'>;

function ModalProvider({ children }: Props) {
  const [modals, setModals] = useState<Modal[]>([]);

  // used when needed to prevent race conditions within side-effects that look up this state
  const isModalOpenRef = useRef(false);
  useEffect(() => {
    isModalOpenRef.current = Boolean(modals.length);
  }, [modals.length]);

  const state = useMemo(() => ({ isModalOpenRef }), [isModalOpenRef]);

  // if provided onCloseOverride prop, this callback will trigger as opposed to closing the modal
  const showModal = useCallback(
    ({
      id = uuid(),
      content,
      headerElement,
      headerText = '',
      hideClose = false,
      headerVariant = 'standard',
      isFullPage = false,
      isPaddingDisabled = false,
      onClose = noop,
      onCloseOverride,
    }: ShowModalFnProps) => {
      setModals((prevModals) => [
        ...prevModals,
        {
          id,
          isActive: true,
          content,
          headerElement,
          hideClose,
          headerText,
          headerVariant,
          isFullPage,
          isPaddingDisabled,
          onClose,
          onCloseOverride,
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

  const setHeaderElement: ModalActions['setHeaderElement'] = useCallback((modalId, element) => {
    setModals((prev) => {
      return prev.map((modal) => {
        if (modal.id === modalId) {
          return {
            ...modal,
            headerElement: element,
          };
        }
        return modal;
      });
    });
  }, []);

  const dismountModal = useCallback((modalId: string) => {
    setModals((prev) => prev.filter(({ id }) => id !== modalId));
  }, []);

  const clearAllModals = useCallback(() => setModals([]), []);

  const actions = useMemo(
    () => ({
      showModal,
      hideModal,
      clearAllModals,
      setHeaderElement,
    }),
    [showModal, hideModal, clearAllModals, setHeaderElement]
  );

  /**
   * EFFECT: Close modal on route change
   */
  const route = useStabilizedRouteTransitionKey();
  useEffect(() => {
    if (isModalOpenRef.current) {
      clearAllModals();
    }
  }, [route, clearAllModals]);

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
          ({
            id,
            isActive,
            content,
            headerElement,
            headerText,
            headerVariant,
            isFullPage,
            isPaddingDisabled,
            hideClose,
            onCloseOverride,
          }) => {
            const hideCurrentModal = () => {
              hideModal({ id });
            };

            return (
              <AnimatedModal
                key={id}
                isActive={isActive}
                hideModal={hideCurrentModal}
                onCloseOverride={onCloseOverride}
                dismountModal={() => dismountModal(id)}
                content={content}
                headerText={headerText}
                isFullPage={isFullPage}
                isPaddingDisabled={isPaddingDisabled}
                hideClose={hideClose}
                headerVariant={headerVariant}
                headerElement={headerElement}
              />
            );
          }
        )}
      </ModalActionsContext.Provider>
    </ModalStateContext.Provider>
  );
}

export default memo(ModalProvider);
