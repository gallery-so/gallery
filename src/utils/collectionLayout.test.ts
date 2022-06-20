import { EditModeToken, EditModeTokenChild } from 'flows/shared/steps/OrganizeCollection/types';
import { getWhitespacePositionsFromStagedItems, insertWhitespaceBlocks } from './collectionLayout';

function generateTestNft(): EditModeToken {
  return {
    id: '123',
    token: {} as EditModeTokenChild, // This is wrong but our test doesn't actually need the data inside the NFT,
  };
}

describe.skip('getWhitespacePositionsFromStagedItems', () => {
  it('computes the correct whitespace list given a list of staged items', () => {
    const stagedItems = [
      { id: 'blank-1', whitespace: 'whitespace' } as const,
      { id: 'blank-2', whitespace: 'whitespace' } as const,
      generateTestNft(),
      { id: 'blank-3', whitespace: 'whitespace' } as const,
      generateTestNft(),
      generateTestNft(),
      generateTestNft(),
      { id: 'blank-4', whitespace: 'whitespace' } as const,
      generateTestNft(),
      { id: 'blank-5', whitespace: 'whitespace' } as const,
    ];
    const whitespaceList = getWhitespacePositionsFromStagedItems(stagedItems);
    expect(whitespaceList).toEqual([0, 0, 1, 4, 5]);
  });
});

describe.skip('insertWhitespaceBlocks', () => {
  it('inserts white spaces into a list of tokens accordingly', () => {
    const tokens = [
      generateTestNft(),
      generateTestNft(),
      generateTestNft(),
      generateTestNft(),
      generateTestNft(),
    ];
    const whitespaceList = [0, 0, 1, 4, 5];
    const whitespacesAndNfts = insertWhitespaceBlocks(tokens, whitespaceList);
    expect(whitespacesAndNfts.length).toEqual(10);
    expect(whitespacesAndNfts[2].id).toEqual(tokens[0].id);
  });
});
