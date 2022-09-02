import { DAppClient } from '@airgap/beacon-sdk';
import { createContext, memo, ReactNode, useContext } from 'react';

export type BeaconState = DAppClient;

export const BeaconContext = createContext<BeaconState | undefined>(undefined);

export const useBeaconState = (): BeaconState => {
  const context = useContext(BeaconContext);
  if (!context) {
    throw new Error('Attempted to use BeaconContext without a provider');
  }

  return context;
};

type Props = { children: ReactNode };

let beaconClient: DAppClient;

if (typeof window !== 'undefined') {
  beaconClient = new DAppClient({ name: 'Gallery' });
}

const BeaconProvider = memo(({ children }: Props) => {
  const state = beaconClient;

  return <BeaconContext.Provider value={state}>{children}</BeaconContext.Provider>;
});

BeaconProvider.displayName = 'BeaconProvider';

export default BeaconProvider;
