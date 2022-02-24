import { getWhitespacePositionsFromStagedItems, insertWhitespaceBlocks } from './collectionLayout';

function generateTestNft() {
  return {
    id: '123',
    name: 'test',
    description: 'test',
    image: {
      url: 'https://example.com/test.jpg',
    },
    metadata: {
      type: 'nft',
    },
  };
}

describe.skip('getWhitespacePositionsFromStagedItems', () => {
  it('computes the correct whitespace list given a list of staged items', () => {
    const stagedItems = [
      { id: 'blank-1' },
      { id: 'blank-2' },
      generateTestNft(),
      { id: 'blank-3' },
      generateTestNft(),
      generateTestNft(),
      generateTestNft(),
      { id: 'blank-4' },
      generateTestNft(),
      { id: 'blank-5' },
    ];
    const whitespaceList = getWhitespacePositionsFromStagedItems(stagedItems);
    expect(whitespaceList).toEqual([0, 0, 1, 4, 5]);
  });
});

describe.skip('insertWhitespaceBlocks', () => {
  it('inserts white spaces into a list of nfts accordingly', () => {
    const nfts = [
      generateTestNft(),
      generateTestNft(),
      generateTestNft(),
      generateTestNft(),
      generateTestNft(),
    ];
    const whitespaceList = [0, 0, 1, 4, 5];
    const whitespacesAndNfts = insertWhitespaceBlocks(nfts, whitespaceList);
    expect(whitespacesAndNfts.length).toEqual(10);
    expect(whitespacesAndNfts[2].id).toEqual(nfts[0].id);
  });
});
