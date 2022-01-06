import { OpenseaAsset, reduceOpenseaAssetsToContractAddresses } from './PartnerMembershipMintPage';

describe('reduceOpenseaAssetsToContractAddresses', () => {
  test('Dedupes assets from the same contract and returns contract address only', () => {
    const asset1: OpenseaAsset = {
      asset_contract: {
        address: '0x123',
      },
    };
    const asset2: OpenseaAsset = {
      asset_contract: {
        address: '0x456',
      },
    };
    const assets = [asset1, asset2, asset1];
    const addresses = reduceOpenseaAssetsToContractAddresses(assets);
    expect(addresses.length).toBe(2);
  });
});
