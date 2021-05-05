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
      image_url: randomPic(),
      image_preview_url: 'test',
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
        image_url: randomPic(),
        image_preview_url: 'test', // track position in "all nfts" array so it's for dnd to mark it as unselected
      },
      index: i,
      isSelected: false,
    });
  }
  return pics;
}
