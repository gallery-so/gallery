import { DAppClient, ExtendedPeerInfo, RequestSignPayloadInput } from '@airgap/beacon-sdk';
import { createContext, memo, ReactNode, useCallback, useContext, useMemo } from 'react';

type PermissionResponse = {
  publicKey: string;
  address: string;
  wallet: string;
};

type friendlyWalletNamingType = { [key: string]: string };

const FriendlyWalletNaming: friendlyWalletNamingType = {
  'Temple - Tezos Wallet': 'Temple',
  'Kukai Wallet': 'Kukai',
  default: 'Tezos',
};

type BeaconActions = {
  requestPermissions: () => Promise<PermissionResponse>;
  requestSignature: (payload: RequestSignPayloadInput) => Promise<string>;
};

const BeaconActionsContext = createContext<BeaconActions | undefined>(undefined);

export const useBeaconActions = (): BeaconActions => {
  const context = useContext(BeaconActionsContext);
  if (!context) {
    throw new Error('Attempted to use BeaconActionsContext without a provider');
  }

  return context;
};

type Props = { children: ReactNode };

let beaconClient: DAppClient;

if (typeof window !== 'undefined') {
  beaconClient = new DAppClient({ name: 'Gallery' });
}

const BeaconProvider = memo(({ children }: Props) => {
  const requestPermissions = useCallback(async () => {
    const { publicKey, address, senderId } = await beaconClient.requestPermissions();

    // Get wallet name
    const peers = (await beaconClient.getPeers()) as ExtendedPeerInfo[];
    const peer = peers.find((peer) => peer.senderId === senderId);

    const walletName = peer?.name || FriendlyWalletNaming.default;

    return {
      publicKey,
      address,
      wallet: FriendlyWalletNaming[walletName] || 'Tezos',
    };
  }, []);

  const requestSignature = useCallback(async (payload: RequestSignPayloadInput) => {
    const { signature } = await beaconClient.requestSignPayload(payload);

    return signature;
  }, []);

  const actions = useMemo(
    () => ({
      requestPermissions,
      requestSignature,
    }),
    [requestPermissions, requestSignature]
  );

  return <BeaconActionsContext.Provider value={actions}>{children}</BeaconActionsContext.Provider>;
});

BeaconProvider.displayName = 'BeaconProvider';

export default BeaconProvider;
