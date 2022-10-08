import {
  EditModeToken,
  EditModeTokenChild,
} from 'flows/../components/ManageGallery/OrganizeCollection/types';
import {
  generateLayoutFromCollection,
  getWhitespacePositionsFromStagedItems,
  insertWhitespaceBlocks,
  parseCollectionLayout,
} from './collectionLayout';

function generateTestNft(): EditModeToken {
  return {
    id: '123',
    token: {} as EditModeTokenChild, // This is wrong but our test doesn't actually need the data inside the NFT,
  };
}

describe('getWhitespacePositionsFromStagedItems', () => {
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

describe('insertWhitespaceBlocks', () => {
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

describe('parseCollectionLayout', () => {
  it('takes a list of tokens and a collectionLayout and builds the collection object', () => {
    const tokens = [
      generateTestNft(),
      generateTestNft(),
      generateTestNft(),
      generateTestNft(),
      generateTestNft(),
      generateTestNft(),
      generateTestNft(),
      generateTestNft(),
      generateTestNft(),
      generateTestNft(),
    ];
    const collectionLayout = {
      sections: [0, 3, 8],
      sectionLayout: [
        { columns: 3, whitespace: [0] },
        { columns: 5, whitespace: [1, 2, 5] },
        { columns: 1, whitespace: [1] },
      ],
    };
    const expectedItemLengths = [4, 8, 3]; // expected number of items in each section including whitespace blocks
    const collection = parseCollectionLayout(tokens, collectionLayout);

    expect(Object.keys(collection).length).toEqual(3);
    Object.keys(collection).forEach((sectionId, index) => {
      const section = collection[sectionId];

      expect(section.columns).toEqual(collectionLayout.sectionLayout[index].columns);
      expect(section.items.length).toEqual(expectedItemLengths[index]);
    });
  });
});

describe('generateLayoutFromCollection', () => {
  it('takes a StagedCollection and generates a layout object that can be saved to the backend', () => {
    const stagedCollection = {
      '123': {
        columns: 3,
        items: [
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
        ],
      },
      '456': {
        columns: 2,
        items: [
          { id: 'blank-1', whitespace: 'whitespace' } as const,
          generateTestNft(),
          generateTestNft(),
          { id: 'blank-1', whitespace: 'whitespace' } as const,
          { id: 'blank-1', whitespace: 'whitespace' } as const,
          generateTestNft(),
          generateTestNft(),
          { id: 'blank-1', whitespace: 'whitespace' } as const,
          { id: 'blank-1', whitespace: 'whitespace' } as const,
          generateTestNft(),
        ],
      },
    };
    const layout = generateLayoutFromCollection(stagedCollection);

    expect(layout).toEqual({
      sections: [0, 5],
      sectionLayout: [
        { columns: 3, whitespace: [0, 0, 1, 4, 5] },
        { columns: 2, whitespace: [0, 2, 2, 4, 4] },
      ],
    });
  });
});
