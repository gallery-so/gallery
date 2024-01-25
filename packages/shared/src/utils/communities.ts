export const BADGE_ENABLED_COMMUNITY_ADDRESSES = new Set([
  // Gallery Premium Membership Cards
  '0xe01569ca9b39e55bc7c0dfa09f05fa15cb4c7698',
]);

// not used anywhere but keeping around for posterity / potential future usage
const KNOWN_OMNIBUS_CONTRACTS = [
  '0xa7d8d9ef8d8ce8992df33d8b8cf4aebabd5bd270', // Art Blocks
  '0x059edd72cd353df5106d2b9cc5ab83a52287ac3a', // Art Blocks
  '0x99a9b7c1116f9ceeb1652de04d5969cce509b069', // Art Blocks
  '0x495f947276749ce646f68ac8c248420045cb7b5e', // OS
  '0xf6793da657495ffeff9ee6350824910abc21356c', // Rarible
  '0x3b3ee1931dc30c1957379fac9aba94d1c48a5405', // Foundation
  '0xdfde78d2baec499fe18f2be74b6c287eed9511d7', // Braindrops
];

export const MINT_LINK_DISABLED_CONTRACTS = new Set([...KNOWN_OMNIBUS_CONTRACTS]);

export const CRYPTOPUNKS_CONTRACT_ADDRESS = '0xb47e3cd837ddf8e4c57f05d70ab865de6e193bbb';
