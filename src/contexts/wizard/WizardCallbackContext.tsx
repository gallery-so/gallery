import {
  createContext,
  useContext,
  memo,
  useState,
  useMemo,
  ReactNode,
} from 'react';

type OnNext = () => void | Promise<void>;

type WizardCallbackState = {
  onNext?: OnNext;
  setOnNext: (onNextHandler: OnNext) => void;
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
  const [onNext, setOnNext] = useState<OnNext>();

  const state = useMemo(() => ({ onNext, setOnNext }), [onNext, setOnNext]);

  return (
    <WizardCallbackContext.Provider value={state}>
      {children}
    </WizardCallbackContext.Provider>
  );
});

export default WizardCallbackProvider;
