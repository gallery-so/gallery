import {
  createContext,
  useContext,
  memo,
  useCallback,
  useMemo,
  useRef,
  ReactNode,
  MutableRefObject,
} from 'react';
import noop from 'utils/noop';

type OnStepChange = () => void | Promise<void>;

type WizardCallbackState = {
  onNext?: MutableRefObject<OnStepChange | undefined>;
  setOnNext: (onNextHandler: OnStepChange | undefined) => void;
  onPrevious?: MutableRefObject<OnStepChange | undefined>;
  setOnPrevious: (onPreviousHandler: OnStepChange | undefined) => void;
};

const WizardCallbackContext = createContext<WizardCallbackState>({
  onNext: undefined,
  setOnNext: noop,
  onPrevious: undefined,
  setOnPrevious: noop,
});

export const useWizardCallback = () => {
  const context = useContext(WizardCallbackContext);
  if (!context) {
    throw new Error('Attempted to use WizardCallbackContext without a provider');
  }

  return context;
};

type Props = { children: ReactNode };

const WizardCallbackProvider = memo(({ children }: Props) => {
  const onNext = useRef<OnStepChange>();
  const onPrevious = useRef<OnStepChange>();

  const setOnNext = useCallback((newOnNext: OnStepChange | undefined) => {
    onNext.current = newOnNext;
  }, []);
  const setOnPrevious = useCallback((newOnPrevious: OnStepChange | undefined) => {
    onPrevious.current = newOnPrevious;
  }, []);

  const state = useMemo(
    () => ({ onNext, setOnNext, onPrevious, setOnPrevious }),
    [onNext, setOnNext, onPrevious, setOnPrevious]
  );

  return <WizardCallbackContext.Provider value={state}>{children}</WizardCallbackContext.Provider>;
});

export default WizardCallbackProvider;
