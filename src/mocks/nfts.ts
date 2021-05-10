import dummy1 from './dummy_1.png';
import dummy2 from './dummy_2.png';
import dummy3 from './dummy_3.png';

function randomPic() {
  const pics = [dummy1, dummy2, dummy3];
  const index = Math.floor(Math.random() * pics.length);
  return pics[index];
}

export function mockNftsLite(n: number) {
  const pics = [];
  for (let i = 0; i < n; i++) {
    pics.push({
      id: `${i}`,
      name: 'test',
      imageUrl: randomPic(),
      imagePreviewUrl: 'test',
    });
  }
  return pics;
}

export function randomPics(n: number) {
  const pics = [];
  for (let i = 0; i < n; i++) {
    pics.push({
      id: `${i}`,
      nft: {
        id: `${i}`,
        name: 'test',
        imageUrl: randomPic(),
        imagePreviewUrl: 'test', // track position in "all nfts" array so it's for dnd to mark it as unselected
      },
      index: i,
      isSelected: false,
    });
  }
  return pics;
}

export function mockSingleNft() {
  const description =
    'A psychedelic piece inspired by the allure of aposematic coloration\n found in plants and the natural world\n\n' +
    '~~~~~\n\n' +
    'All details and elements in this piece are purely photographic, which have been carefully cut out and arranged into a floral composition, then digitally animated and colour graded.\n\n' +
    '~~~~~\n\n' +
    'The creative process is a very meditative experience, which is transmitted from the final result to the viewer as a hypnotic loop.';
  return {
    id: '1',
    name: 'The Fold Ep2',
    platformName: 'SuperRare',
    ownerName: 'Fabric Softener',
    imageUrl:
      'https://ipfs.pixura.io/ipfs/QmPN9kEevrvSjjFhScVEHP6t8QC2dRY2PGFmcE8Yz6aUvv/Dom-Qwek_Broken-1_2021.jpg',
    imagePreviewUrl: 'string',
    description,
  };
}
