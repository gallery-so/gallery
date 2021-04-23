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
  enableNext: () => void;
  disableNext: () => void;
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

  const enableNext = useCallback(() => {
    setWizardValidationState({ ...wizardValidationState, isNextEnabled: true });
  }, [wizardValidationState]);

  const disableNext = useCallback(() => {
    setWizardValidationState({
      ...wizardValidationState,
      isNextEnabled: false,
    });
  }, [wizardValidationState]);

  const wizardValidationActions: WizardValidationActions = useMemo(
    () => ({ enableNext, disableNext }),
    [disableNext, enableNext]
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
