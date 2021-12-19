import { WalletLinkConnector } from '@web3-react/walletlink-connector';

// manual types for the coinbase wallet provider since the library doesn't export it
type JSONRPCRequest<T> = {
  jsonrpc: string;
  id: number;
  method: string;
  params: T;
};

type JSONRPCResponse<T> = {
  jsonrpc: string;
  id: number;
  result: T;
};

type Callback<T> = (error: Error | null, response: JSONRPCResponse<T>) => void;

type WalletLinkProvider = {
  sendAsync: <RequestPayload, ResponsePayload>(
    request: JSONRPCRequest<RequestPayload>,
    callback: Callback<ResponsePayload>
  ) => void;
};

type Parameters = {
  connector: WalletLinkConnector;
  nonce: string;
  address: string;
};

type Signature = string;

export default async function walletlinkSigner({
  connector,
  nonce,
  address,
}: Parameters): Promise<Signature> {
  const provider = (await connector.getProvider()) as WalletLinkProvider;

  return new Promise((resolve, reject) => {
    provider.sendAsync<string[], string>(
      {
        jsonrpc: '2.0',
        id: 1,
        method: 'personal_sign',
        params: [nonce, address],
      },
      (error, response) => {
        if (error) {
          reject(error);
        }

        if (!response) {
          reject(new Error('no signature received'));
        }

        resolve(response?.result);
      }
    );
  });
}
