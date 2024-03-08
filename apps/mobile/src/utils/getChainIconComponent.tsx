import { View } from 'react-native';
import { ArbitrumIcon } from 'src/icons/ArbitrumIcon';
import { BaseIcon } from 'src/icons/BaseIcon';
import { EthIcon } from 'src/icons/EthIcon';
import { OptimismIcon } from 'src/icons/OptimismIcon';
import { PoapIcon } from 'src/icons/PoapIcon';
import { PolygonIcon } from 'src/icons/PolygonIcon';
import { TezosIcon } from 'src/icons/TezosIcon';
import { WorldIcon } from 'src/icons/WorldIcon';
import { ZoraIcon } from 'src/icons/ZoraIcon';

import { ChainMetadata } from '~/shared/utils/chains';

export function getChainIconComponent(chain: ChainMetadata) {
  switch (chain.name) {
    case 'All Networks':
      return <WorldIcon />;
    case 'Ethereum':
      return <EthIcon />;

    case 'Tezos':
      return <TezosIcon />;

    case 'POAP':
      return <PoapIcon className="w-4 h-4" />;

    case 'Zora':
      return <ZoraIcon />;

    case 'Arbitrum':
      return <ArbitrumIcon />;

    case 'Base':
      return <BaseIcon />;

    case 'Optimism':
      return <OptimismIcon />;

    case 'Polygon':
      return <PolygonIcon />;

    default:
      return <View className="w-4 h-4 rounded-full bg-porcelain dark:bg-metal" />;
      break;
  }
}
