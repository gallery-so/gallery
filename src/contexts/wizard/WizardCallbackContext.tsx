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

type OnNext = () => void | Promise<void>;

type WizardCallbackState = {
  onNext?: MutableRefObject<OnNext | undefined>;
  setOnNext: (onNextHandler: OnNext | undefined) => void;
};

const WizardCallbackContext = createContext<WizardCallbackState>({
  onNext: undefined,
  setOnNext: () => {},
});

export const useWizardCallback = () => {
  const context = useContext(WizardCallbackContext);
  if (!context) {
    throw Error('Attempted to use WizardCallbackContext without a provider');
  }
  return context;
};

type Props = { children: ReactNode };

const WizardCallbackProvider = memo(({ children }: Props) => {
  const onNext = useRef<OnNext>();
  const setOnNext = useCallback((newOnNext) => {
    onNext.current = newOnNext;
  }, []);

  const state = useMemo(() => ({ onNext, setOnNext }), [onNext, setOnNext]);

  return (
    <WizardCallbackContext.Provider value={state}>
      {children}
    </WizardCallbackContext.Provider>
  );
});

export default WizardCallbackProvider;
