import {
  createContext,
  memo,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';

export type WizardValidationState = {
  isNextEnabled: boolean;
};
const WizardValidationStateContext = createContext<WizardValidationState>({
  isNextEnabled: false,
});

export const useWizardValidationState = (): WizardValidationState => {
  const context = useContext(WizardValidationStateContext);
  if (!context) {
    throw Error(
      'Attempted to use WizardValidationStateContext without a provider'
    );
  }
  return context;
};

type WizardValidationActions = {
  setNextEnabled: (isEnabled: boolean) => void;
};

const WizardValidationActionsContext = createContext<
  WizardValidationActions | undefined
>(undefined);

export const useWizardValidationActions = (): WizardValidationActions => {
  const context = useContext(WizardValidationActionsContext);
  if (!context) {
    throw Error(
      'Attempted to use WizardValidationActionsContext without a provider'
    );
  }
  return context;
};

type Props = { children: ReactNode };

const WizardValidationProvider = memo(({ children }: Props) => {
  const [
    wizardValidationState,
    setWizardValidationState,
  ] = useState<WizardValidationState>({
    isNextEnabled: false,
  });

  const setNextEnabled = useCallback((isNextEnabled) => {
    setWizardValidationState((prevState) => ({ ...prevState, isNextEnabled }));
  }, []);

  const wizardValidationActions: WizardValidationActions = useMemo(
    () => ({ setNextEnabled }),
    [setNextEnabled]
  );

  return (
    <WizardValidationStateContext.Provider value={wizardValidationState}>
      <WizardValidationActionsContext.Provider value={wizardValidationActions}>
        {children}
      </WizardValidationActionsContext.Provider>
    </WizardValidationStateContext.Provider>
  );
});

export default WizardValidationProvider;
