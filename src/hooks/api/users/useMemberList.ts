import { MembershipTier } from 'types/MembershipTier';
import useGet from '../_rest/useGet';

export default function useMemberList() {
  // const data = useGet<GetMemberListResponse>(`/users/membership`, 'fetch member list');

  // if (!data) {
  //   throw new Error('Error fetching member list');
  // }

  // console.log({ data });

  // return data.tiers;

  return [
    {
      id: '1',
      name: 'Tier 1',
      owners: [
        { user_id: '1', username: 'robin', address: '0x1', preview_nfts: ['1', '2'] },
        { user_id: '2', username: 'kaito', address: '0x2', preview_nfts: ['3', '4'] },
        { user_id: '3', username: 'mike', address: '0x3', preview_nfts: ['5', '6'] },
        { user_id: '4', username: 'benny', address: '0x4', preview_nfts: ['7', '8'] },
        { user_id: '5', username: '0xeth', address: '0x5', preview_nfts: ['9', '10'] },
        {
          user_id: '6',
          username: 'wwwwwwwwwwwwwwwwwwww',
          address: '0x6',
          preview_nfts: ['11', '12'],
        },
        { user_id: '7', username: '123_collector', address: '0x7', preview_nfts: ['13', '14'] },
        { user_id: '8', username: 'jon', address: '0x8', preview_nfts: ['15', '16'] },
      ],
      asset_url: 'https://www.example.com/tier1.png',
      token_id: '1',
    },
    {
      id: '2',
      name: 'Tier 2',
      owners: [
        { user_id: '4', username: 'user4', address: '0x4', preview_nfts: ['7', '8'] },
        { user_id: '5', username: 'user5', address: '0x5', preview_nfts: ['9', '10'] },
        { user_id: '6', username: 'user6', address: '0x6', preview_nfts: ['11', '12'] },
      ],
      asset_url: 'https://www.example.com/tier1.png',
      token_id: '2',
    },
  ] as MembershipTier[];
}
