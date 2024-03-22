import { WalletConnectModal } from '@walletconnect/modal-react-native';

const projectId = '93ea9c14da3ab92ac4b72d97c124b96c';

const providerMetadata = {
  name: 'Gallery',
  description: 'Gallery Mobile App',
  url: 'https://gallery.so',
  icons: [
    'https://f4shnljo4g7olt4wifnpdfz6752po37hr3waoaxakgpxqw64jojq.arweave.net/LyR2rS7hvuXPlkFa8Zc-_3T3b-eO7AcC4FGfeFvcS5M',
  ],
  redirect: {
    native: 'applinks:gallery.so/',
    universal: 'https://gallery.so',
  },
};

export function WalletConnectProvider() {
  return <WalletConnectModal projectId={projectId} providerMetadata={providerMetadata} />;
}
