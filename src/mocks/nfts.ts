import { Nft } from 'types/Nft';
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
    const imgUrl = randomPic();
    pics.push({
      id: `${i}`,
      name: 'test',
      imageUrl: imgUrl,
      imagePreviewUrl: imgUrl,
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
        imagePreviewUrl: 'test',
      },
      index: i,
      isSelected: false,
    });
  }
  return pics;
}

export function mockSingleNft() {
  return IMAGE_NFT;
}

export const IMAGE_NFT: Nft = {
  id: '45123412',
  name: 'Meebit #1518',
  platformName: 'SuperRare',
  ownerName: 'Fabric Softener',
  imageUrl:
    'https://lh3.googleusercontent.com/Rg_zPt7X0HkBPGicT_cEnnLJi6OCCsYrs2-juACYdB3s264BP0_KiDVq9r7qkZJ2JenbIxbzMGUsbPqp19belWoFYPOuqZwCVgDStLY',
  imagePreviewUrl:
    'https://lh3.googleusercontent.com/Rg_zPt7X0HkBPGicT_cEnnLJi6OCCsYrs2-juACYdB3s264BP0_KiDVq9r7qkZJ2JenbIxbzMGUsbPqp19belWoFYPOuqZwCVgDStLY=s250',
  description: 'Meebit #1518',
};

export const VIDEO_NFT: Nft = {
  id: '14214123',
  name: 'old gods | hound 0002',
  platformName: 'SuperRare',
  ownerName: 'Fabric Softener',
  imageUrl:
    'https://lh3.googleusercontent.com/GALUaOkuWm9YRaRvNZjnheAYISJ_xkAEJ11UtYUL5TXPuKPPlhp9xhOe4y8gFYYEBn6G49WQq1AsSndwrIOzwhEUnkxIm-CqzJhHoQ',
  imagePreviewUrl:
    'https://lh3.googleusercontent.com/GALUaOkuWm9YRaRvNZjnheAYISJ_xkAEJ11UtYUL5TXPuKPPlhp9xhOe4y8gFYYEBn6G49WQq1AsSndwrIOzwhEUnkxIm-CqzJhHoQ=s250',
  animationUrl:
    'https://storage.opensea.io/files/9f23092e570255e42931fd375495ae7d.mp4',
  description: 'digital mixed media study',
};

export const AUDIO_NFT: Nft = {
  id: '7389123',
  name: 'Circular Silver Edition (Mix: 0000)',
  platformName: 'AsyncArt',
  ownerName: 'Fabric Softener',
  imageUrl:
    'https://lh3.googleusercontent.com/8Y4OJ_pMTC0p5r5_83qGsHlTEJA_5543uQNhX_WRQKvlca3s8DqxO_IW1WQu1s0h8pcKVA3xrHX0uAgiMq0PiLbUamjatLQY9c0F',
  imagePreviewUrl:
    'https://lh3.googleusercontent.com/8Y4OJ_pMTC0p5r5_83qGsHlTEJA_5543uQNhX_WRQKvlca3s8DqxO_IW1WQu1s0h8pcKVA3xrHX0uAgiMq0PiLbUamjatLQY9c0F=s250',
  animationUrl:
    'https://storage.opensea.io/files/8bcd860d38d598f4ab224c7cbd2a0890.mp3',
  description:
    'A circular song with no final state. It has a fuzzy quality to it, something warm and inviting but with no clear resolution, kind of like a circle.',
};

export const ANIMATION_NFT: Nft = {
  id: '4123122',
  name: 'EnergySculpture #331"',
  platformName: 'Art Blocks',
  ownerName: 'Fabric Softener',
  imageUrl:
    'https://lh3.googleusercontent.com/YPh7Eq-kHet0FIE4vb5qBu_3MG-tCzVx1DE53LAGbU_31h66W8kKEJt-f8MfxDtAetHudq62uBcxfn0IYMpWVrZKbZclylGzKrWVCCI',
  imagePreviewUrl:
    'https://lh3.googleusercontent.com/YPh7Eq-kHet0FIE4vb5qBu_3MG-tCzVx1DE53LAGbU_31h66W8kKEJt-f8MfxDtAetHudq62uBcxfn0IYMpWVrZKbZclylGzKrWVCCI=s250',
  animationUrl:
    'https://storage.opensea.io/files/28f7c1a47b9515a8b3aaa686cdcbcb0a.html',
  description:
    'To become an Energy Sculptor, you first have to find your way into MU. Once arrived, an extensive period of trials will test your capabilities for earning the right to be an Energy Sculptor.\n\nThis project is part of The Realm of MU saga. Additional project feature(s) => MotionState: Flow, DelayMode: Slacker, DimensionalBalance: Unstable, ColorBase(0-255): 161',
};

const MOCK_NFTS_BY_ID: { [key: string]: Nft } = {
  '45123412': IMAGE_NFT,
  '14214123': VIDEO_NFT,
  '7389123': AUDIO_NFT,
  '4123122': ANIMATION_NFT,
};

export function getMockNftById(id: string) {
  return MOCK_NFTS_BY_ID[id];
}
