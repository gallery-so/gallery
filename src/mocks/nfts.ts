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
  id: 'b37f9d294ed430db15bfdb9d14a83d79',
  creation_time: 0,
  name: 'FVCK_CRYSTAL// #3314',
  description:
    'FVCK_CRYSTAL// is a computer generated project designed by FVCKRENDER. There is a limited supply of 4169 unique NFT variations. These stones will be used for future FVCKRENDER projects like events, raffles, airdrops and more.\n\nExplore the FVCKRENDERVERSE// here:\n\nwww.fvckrenderverse.com',
  collectors_note: '',
  user_id: 'bad81b835d982baf42afbb41ec2acc83',
  external_url: '',
  token_metadata_url: '',
  creator_address: '',
  creator_name: '',
  owner_address: '0x70D04384b5c3a466EC4D8CFB8213Efc31C6a9D15',
  asset_contract: {
    contract_image_url: '',
    address: '0x7afeda4c714e1c0a2a1248332c100924506ac8e6',
    name: 'FVCK_CRYSTAL//',
    description:
      'FVCK_CRYSTAL// is a collection of 4169 precious stones designed by FVCKRENDER. These NFTs will allow users to participate in future events, raffles, and exclusive areas of the FVCKRENDERVERSE//.\r\n\r\nNo FOMO bullshit curve, hodlers will be able to burn their fvckrender open editions before public sale which will give advantage in time.\r\n\r\nEach crystals has been computer generated and optimized for future utility. Using the most iconic FVCKRENDER elements frozen in time inside each crystal. They all look sick, however some are more rare than others.',
    external_link: 'https://fvckcrystal.xyz/',
    schema_name: 'ERC721',
    symbol: 'CRYST',
    total_supply: '',
  },
  opensea_id: 35737740,
  opensea_token_id: '3314',
  image_url:
    'https://lh3.googleusercontent.com/wwF7TCrxFbjgKmUI4PHPdvGs4sdw3IgqbQ_Gm2Rp0RtSIOh2sN8rBu0K4HFJjsHyNV4xl0pKVumOSM7ztSd3In5yN_dDWB52mE92IQ',
  image_thumbnail_url:
    'https://lh3.googleusercontent.com/wwF7TCrxFbjgKmUI4PHPdvGs4sdw3IgqbQ_Gm2Rp0RtSIOh2sN8rBu0K4HFJjsHyNV4xl0pKVumOSM7ztSd3In5yN_dDWB52mE92IQ=s128',
  image_preview_url:
    'https://lh3.googleusercontent.com/wwF7TCrxFbjgKmUI4PHPdvGs4sdw3IgqbQ_Gm2Rp0RtSIOh2sN8rBu0K4HFJjsHyNV4xl0pKVumOSM7ztSd3In5yN_dDWB52mE92IQ=s250',
  image_original_url:
    'https://arweave.net/6tBalQk19AUQ5FF0QPW9MT-zrHb_OFZbGV_3NpJeqj0',
  animation_url: '',
  animation_original_url: '',
  acquisition_date: '',
};

export const VIDEO_NFT: Nft = {
  id: '3545bf6b93a416e21810fd8de297a9dc',
  creation_time: 0,
  name: 'Particle Story 007',
  description:
    '"Particle Stories" is a collection of animated, fine art NFTs by artist Duncan Rogoff. The project aims to blend traditional fine art sensibilities with modern day techniques. Each piece will feature its own visuals mixed with unique sound design. \n\nParticles simulations are only available to digital artists. They require heavy processing power and hours of trial and error to achieve the desired look. While they are simulated based on physical properties creating an element of randomness, the right artist is able to art direct them into the intended state.\n\n"Particle Stories" was concepted out of a desire to merge the two worlds of traditional and digital art, and to create affordable fine art pieces for the everyday collector.',
  collectors_note: '',
  user_id: 'bad81b835d982baf42afbb41ec2acc83',
  external_url: '',
  token_metadata_url: '',
  creator_address: '',
  creator_name: '',
  owner_address: '0x70D04384b5c3a466EC4D8CFB8213Efc31C6a9D15',
  asset_contract: {
    contract_image_url: '',
    address: '0xfee39ac7941c78f0592fa5aba1688211aa4e6d66',
    name: 'Particle Stories',
    description: '',
    external_link:
      'https://app.rarible.com/collection/0xfee39ac7941c78f0592fa5aba1688211aa4e6d66',
    schema_name: 'ERC1155',
    symbol: 'pStories',
    total_supply: '',
  },
  opensea_id: 38536043,
  opensea_token_id: '9',
  image_url:
    'https://lh3.googleusercontent.com/50sMqjCpm8VOonU0sx-qNRAo79vrmvc9jM5O6BKRnZgbQc6SvfR7SrLTL_RSYz3_WBFbG1VPzYfLwkumw6OR9NuIHBStJQd-DkUi',
  image_thumbnail_url:
    'https://lh3.googleusercontent.com/50sMqjCpm8VOonU0sx-qNRAo79vrmvc9jM5O6BKRnZgbQc6SvfR7SrLTL_RSYz3_WBFbG1VPzYfLwkumw6OR9NuIHBStJQd-DkUi=s128',
  image_preview_url:
    'https://lh3.googleusercontent.com/50sMqjCpm8VOonU0sx-qNRAo79vrmvc9jM5O6BKRnZgbQc6SvfR7SrLTL_RSYz3_WBFbG1VPzYfLwkumw6OR9NuIHBStJQd-DkUi=s250',
  image_original_url:
    'https://ipfs.io/ipfs/QmZh5CLYZcwaw7W7MG6iw75evcr5qsz6q1tTVqcW7TwnDn/image.png',
  animation_url:
    'https://storage.opensea.io/files/e3b15b464f084b26ffa35dcffeafe6c1.mp4',
  animation_original_url:
    'https://ipfs.io/ipfs/QmZh5CLYZcwaw7W7MG6iw75evcr5qsz6q1tTVqcW7TwnDn/animation.mp4',
  acquisition_date: '',
};

export const AUDIO_NFT: Nft = {
  id: '3545bf6b93a416e21810fd8de297a9dc',
  creation_time: 0,
  name: 'Particle Story 007',
  description:
    '"Particle Stories" is a collection of animated, fine art NFTs by artist Duncan Rogoff. The project aims to blend traditional fine art sensibilities with modern day techniques. Each piece will feature its own visuals mixed with unique sound design. \n\nParticles simulations are only available to digital artists. They require heavy processing power and hours of trial and error to achieve the desired look. While they are simulated based on physical properties creating an element of randomness, the right artist is able to art direct them into the intended state.\n\n"Particle Stories" was concepted out of a desire to merge the two worlds of traditional and digital art, and to create affordable fine art pieces for the everyday collector.',
  collectors_note: '',
  user_id: 'bad81b835d982baf42afbb41ec2acc83',
  external_url: '',
  token_metadata_url: '',
  creator_address: '',
  creator_name: '',
  owner_address: '0x70D04384b5c3a466EC4D8CFB8213Efc31C6a9D15',
  asset_contract: {
    contract_image_url: '',
    address: '0xfee39ac7941c78f0592fa5aba1688211aa4e6d66',
    name: 'Particle Stories',
    description: '',
    external_link:
      'https://app.rarible.com/collection/0xfee39ac7941c78f0592fa5aba1688211aa4e6d66',
    schema_name: 'ERC1155',
    symbol: 'pStories',
    total_supply: '',
  },
  opensea_id: 38536043,
  opensea_token_id: '9',
  image_url:
    'https://lh3.googleusercontent.com/8Y4OJ_pMTC0p5r5_83qGsHlTEJA_5543uQNhX_WRQKvlca3s8DqxO_IW1WQu1s0h8pcKVA3xrHX0uAgiMq0PiLbUamjatLQY9c0F',
  image_thumbnail_url:
    'https://lh3.googleusercontent.com/8Y4OJ_pMTC0p5r5_83qGsHlTEJA_5543uQNhX_WRQKvlca3s8DqxO_IW1WQu1s0h8pcKVA3xrHX0uAgiMq0PiLbUamjatLQY9c0F=s128',
  image_preview_url:
    'https://lh3.googleusercontent.com/8Y4OJ_pMTC0p5r5_83qGsHlTEJA_5543uQNhX_WRQKvlca3s8DqxO_IW1WQu1s0h8pcKVA3xrHX0uAgiMq0PiLbUamjatLQY9c0F=s250',
  image_original_url:
    'https://ipfs.io/ipfs/QmZh5CLYZcwaw7W7MG6iw75evcr5qsz6q1tTVqcW7TwnDn/image.png',
  animation_url:
    'https://storage.opensea.io/files/8bcd860d38d598f4ab224c7cbd2a0890.mp3',
  animation_original_url:
    'https://storage.opensea.io/files/8bcd860d38d598f4ab224c7cbd2a0890.mp3',
  acquisition_date: '',
};

export const ANIMATION_NFT: Nft = {
  id: '3545bf6b93a416e21810fd8de297a9dc',
  creation_time: 0,
  name: 'Particle Story 007',
  description:
    '"Particle Stories" is a collection of animated, fine art NFTs by artist Duncan Rogoff. The project aims to blend traditional fine art sensibilities with modern day techniques. Each piece will feature its own visuals mixed with unique sound design. \n\nParticles simulations are only available to digital artists. They require heavy processing power and hours of trial and error to achieve the desired look. While they are simulated based on physical properties creating an element of randomness, the right artist is able to art direct them into the intended state.\n\n"Particle Stories" was concepted out of a desire to merge the two worlds of traditional and digital art, and to create affordable fine art pieces for the everyday collector.',
  collectors_note: '',
  user_id: 'bad81b835d982baf42afbb41ec2acc83',
  external_url: '',
  token_metadata_url: '',
  creator_address: '',
  creator_name: '',
  owner_address: '0x70D04384b5c3a466EC4D8CFB8213Efc31C6a9D15',
  asset_contract: {
    contract_image_url: '',
    address: '0xfee39ac7941c78f0592fa5aba1688211aa4e6d66',
    name: 'Particle Stories',
    description: '',
    external_link:
      'https://app.rarible.com/collection/0xfee39ac7941c78f0592fa5aba1688211aa4e6d66',
    schema_name: 'ERC1155',
    symbol: 'pStories',
    total_supply: '',
  },
  opensea_id: 38536043,
  opensea_token_id: '9',
  image_url:
    'https://lh3.googleusercontent.com/YPh7Eq-kHet0FIE4vb5qBu_3MG-tCzVx1DE53LAGbU_31h66W8kKEJt-f8MfxDtAetHudq62uBcxfn0IYMpWVrZKbZclylGzKrWVCCI',
  image_thumbnail_url:
    'https://lh3.googleusercontent.com/YPh7Eq-kHet0FIE4vb5qBu_3MG-tCzVx1DE53LAGbU_31h66W8kKEJt-f8MfxDtAetHudq62uBcxfn0IYMpWVrZKbZclylGzKrWVCCI=s128',
  image_preview_url:
    'https://lh3.googleusercontent.com/YPh7Eq-kHet0FIE4vb5qBu_3MG-tCzVx1DE53LAGbU_31h66W8kKEJt-f8MfxDtAetHudq62uBcxfn0IYMpWVrZKbZclylGzKrWVCCI=s250',
  image_original_url:
    'https://lh3.googleusercontent.com/YPh7Eq-kHet0FIE4vb5qBu_3MG-tCzVx1DE53LAGbU_31h66W8kKEJt-f8MfxDtAetHudq62uBcxfn0IYMpWVrZKbZclylGzKrWVCCI',
  animation_url:
    'https://storage.opensea.io/files/28f7c1a47b9515a8b3aaa686cdcbcb0a.html',
  animation_original_url:
    'https://storage.opensea.io/files/28f7c1a47b9515a8b3aaa686cdcbcb0a.html',
  acquisition_date: '',
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
