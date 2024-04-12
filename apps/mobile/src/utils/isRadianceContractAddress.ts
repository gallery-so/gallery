const RADIANCE_CONTRACT_ADDRESS = '0x78b92e9afd56b033ead2103f07aced5fac8c0854';

export const isRadianceContractAddress = (contractAddress: string): boolean => {
  return contractAddress === RADIANCE_CONTRACT_ADDRESS;
};
