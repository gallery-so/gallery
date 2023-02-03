import { createContext, memo, ReactNode, useCallback, useContext, useMemo, useState } from 'react';

export type CollectionWizardState = {
  collectionIdBeingEdited?: string;
};

const CollectionWizardStateContext = createContext<CollectionWizardState | undefined>(undefined);

export const useCollectionWizardState = (): CollectionWizardState => {
  const context = useContext(CollectionWizardStateContext);

  if (!context) {
    throw new Error('Attempted to use CollectionWizardStateContext without a provider');
  }

  return context;
};

type CollectionWizardActions = {
  setCollectionIdBeingEdited: (collectionId: string) => void;
};

const CollectionWizardActionsContext = createContext<CollectionWizardActions | undefined>(
  undefined
);

export const useCollectionWizardActions = (): CollectionWizardActions => {
  const context = useContext(CollectionWizardActionsContext);
  if (!context) {
    throw new Error('Attempted to use CollectionWizardActionsContext without a provider');
  }

  return context;
};

type Props = { children: ReactNode; initialCollectionId?: string };

const CollectionWizardProvider = memo(({ children, initialCollectionId }: Props) => {
  const [CollectionWizardState, setCollectionWizardState] = useState<CollectionWizardState>({
    collectionIdBeingEdited: initialCollectionId,
  });

  const setCollectionIdBeingEdited = useCallback((collectionIdBeingEdited: string) => {
    setCollectionWizardState((previousState) => ({
      ...previousState,
      collectionIdBeingEdited,
    }));
  }, []);

  const CollectionWizardActions: CollectionWizardActions = useMemo(
    () => ({ setCollectionIdBeingEdited }),
    [setCollectionIdBeingEdited]
  );

  return (
    <CollectionWizardStateContext.Provider value={CollectionWizardState}>
      <CollectionWizardActionsContext.Provider value={CollectionWizardActions}>
        {children}
      </CollectionWizardActionsContext.Provider>
    </CollectionWizardStateContext.Provider>
  );
});

CollectionWizardProvider.displayName = 'CollectionWizardProvider';

export default CollectionWizardProvider;
