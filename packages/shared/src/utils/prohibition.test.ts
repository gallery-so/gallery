import { isKnownComputeIntensiveToken } from './prohibition';

describe('prohibition', () => {
  test('isKnownComputeIntensiveToken', () => {
    // prohibition + offending tokens
    expect(
      isKnownComputeIntensiveToken('0x47a91457a3a1f700097199fd63c039c4784384ab', '1E84805') // 32000005
    ).toBe(true);
    expect(
      isKnownComputeIntensiveToken('0x47a91457a3a1f700097199fd63c039c4784384ab', '56C8D23') // 91000099
    ).toBe(true);

    // non-prohibition contract
    expect(isKnownComputeIntensiveToken('some_other_contract', '1E84805')).toBe(false);

    // prohibition + non-offending tokens
    expect(
      isKnownComputeIntensiveToken('0x47a91457a3a1f700097199fd63c039c4784384ab', 'F4240') // 1000000
    ).toBe(false);
  });
});
