import { MembershipTier } from 'types/MembershipTier';
import useGet from '../_rest/useGet';

const mockData = [
  {
    id: '1',
    name: 'VIP',
    owners: [
      {
        user_id: '1',
        username: 'robin',
        address: '0x1',
        preview_nfts: [
          'https://lh3.googleusercontent.com/KCo-vgwP_U1TDPApQUT9jAIkOK_hE3YKFRuhUBHSJCOy06a2KLEg6h7hrAkGl-sSManqweG9gei9C_tasquJfv6ILbPSUCtdoO9AI6k',
          'https://lh3.googleusercontent.com/G2B2JBfHrVD5z4o0i3It6HS1q73vcq5G7lwlSZbTh74NEVK0XtpjKg49_8rXSw4OSKPnXdX9QkUdnkMuYuN_q5Ov_sM2O0P8voOJaw',
          'https://lh3.googleusercontent.com/F5mEOATk-cp0zEfMw4_6qlzw2plmJPFDR9cyDUGhMFNQvNDIwyT-XQDUbZr0QMKmv59r8N223MTzqkHna6ToNTkrc0lmmM7tDfV3Hw',
        ],
      },
      {
        user_id: '2',
        username: 'kaito',
        address: '0x2',
        preview_nfts: [
          'https://lh3.googleusercontent.com/kOnoQtIQslGFMlxXXGxPtnjCbUvOr1EuIePKC0DJsTsvvV__ytpVoywQ9Fkl8KAxWAwKP2coUj7N-Pk_e_hyTXEKgyzYPJKRcBrULQ',
          'https://lh3.googleusercontent.com/e6TUIbQkZnRj7mMlCZQY5CSO_Dw8Sxd96QzkcjC_btVW-9R3Mw8uPLuXLLF1C3tF-XKY8mtiRnsR3-fo3hK7r74_VVTluAe1lr_-lQ',
          'https://lh3.googleusercontent.com/M3XJmG6g8ESS7a2aM4MInWoHpM9pdiQVRoqtbSqBP02y2tFMbHK3SlZc_9tQjEmy4ZWJZP9lKsdAy3mkCcm0026Vlzu2uZ-BEXSeCw',
        ],
      },
      {
        user_id: '3',
        username: 'mike',
        address: '0x3',
        preview_nfts: [
          'https://lh3.googleusercontent.com/MVXYwQUGcQH6zTNxDRHrB1fr8XNtpiaG95W0GRD_DyXfaJaBYAlyUDlMR58HH29c_DmeAgTpZuGaKksToms7Z0PSeXROYCPKFJ_RdA',
          'https://lh3.googleusercontent.com/Zc1qcMgkzxF6T-Xb09Ldj2Nl743kUyHBc_uc4h6aPa5B6zfddwoFU8J6-ooYTby1CbEp2v-Y9Pw7ItCasPA8A7VIRO7lbt_LQVIoQg',
          'https://lh3.googleusercontent.com/8XS2-CgmpDQJ44vmvEvQxN9b8s0MCbK1pqNN-g4IarI9at4Yqs2DBmc1RURa9kOxEOULqDLEgJr-Oo3xKtLLW0lN1TfFwyDsjp36n0M',
        ],
      },
      {
        user_id: '4',
        username: 'benny',
        address: '0x4',
        preview_nfts: [
          'https://lh3.googleusercontent.com/uui66ipvNEZAapvcgLgg7rFtVvmPaV9COj_ZEkxKPeKQj5VjRkjDos256kgh_IzdZZYZvPZ15m14eUTq9bDIFDYn0KxMQidmdfhL9tk',
          'https://lh3.googleusercontent.com/A-FlCG_rrh3HQzTrpk9sm7kOAXPAH5Ml145dyvV8MY4vGKaVD2b1WWfHDCyYJZUbX2Wxg9D1hLeRSKWshQeNRE0g8HXjHKHROlmWQIg',
          'https://lh3.googleusercontent.com/ryXeL4l3ki5pZ0gSB84VVlglKP2zjOwAuJIf9GQCw4uGXu-wpB3TVk0RAPWHT-RhVVRLp5AYON1D6116Su_p9G3QCvFzMXwH57AFbQ',
        ],
      },
      { user_id: '5', username: '0xeth', address: '0x5', preview_nfts: ['9', '10'] },
      {
        user_id: '6',
        username: 'wwwwwwwwwwwwwwwwwwww',
        address: '0x6',
        preview_nfts: ['11', '12'],
      },
      { user_id: '7', username: '123_collector', address: '0x7', preview_nfts: ['13', '14'] },
      {
        user_id: '8',
        username: 'jon',
        address: '0x8',
        preview_nfts: [
          'https://lh3.googleusercontent.com/IjVpC8oOvRYTeZovlmBvEKyfbJFbTRoiP5RzrnsCHbSy8v6q2j_Qi8Kay8gxW69iYxU6Xpv1Lmlk5l0iEIrYtWeZ_bpvht_VzHQjwQ',
          'https://lh3.googleusercontent.com/7ZobNeOVuaXobUA2OnY6BIduajhhjViIrl3kVk0vFaZiqU9nw3Bq7if_FotPkpq1e4veI-oRCcerVcrUnBCtzF2--30WBppn3OSM',
          'https://lh3.googleusercontent.com/CtbIDnnzTJJNYlDpC8gJGVa621Q3SM3k6olnMZVU_3UsqdWY-17PXOPLhkHJzsb_Nu-t96LFVNRyyEdzgp66lz36nIhv3NLhMRIx5w',
        ],
      },
    ],
    asset_url: 'https://www.example.com/tier1.png',
    token_id: '1',
  },
  {
    id: '2',
    name: 'Founding',
    owners: [
      { user_id: '4', username: 'user4', address: '0x4', preview_nfts: ['7', '8'] },
      { user_id: '5', username: 'user5', address: '0x5', preview_nfts: ['9', '10'] },
      { user_id: '6', username: 'user6', address: '0x6', preview_nfts: ['11', '12'] },
      { user_id: '7', username: 'user7', address: '0x7', preview_nfts: ['13', '14'] },
      { user_id: '8', username: 'user8', address: '0x8', preview_nfts: ['15', '16'] },
      { user_id: '9', username: 'user9', address: '0x9', preview_nfts: ['17', '18'] },
      { user_id: '10', username: 'user10', address: '0x10', preview_nfts: ['19', '20'] },
      { user_id: '11', username: 'user11', address: '0x11', preview_nfts: ['21', '22'] },
      { user_id: '12', username: 'user12', address: '0x12', preview_nfts: ['23', '24'] },
      { user_id: '13', username: 'user13', address: '0x13', preview_nfts: ['25', '26'] },
      { user_id: '14', username: 'user14', address: '0x14', preview_nfts: ['27', '28'] },
      { user_id: '15', username: 'user15', address: '0x15', preview_nfts: ['29', '30'] },
      { user_id: '16', username: 'user16', address: '0x16', preview_nfts: ['31', '32'] },
      { user_id: '17', username: 'user17', address: '0x17', preview_nfts: ['33', '34'] },
    ],
    asset_url: 'https://www.example.com/tier1.png',
    token_id: '2',
  },
  {
    id: '3',
    name: 'Gold',
    owners: [
      { user_id: '4', username: 'user4', address: '0x4', preview_nfts: ['7', '8'] },
      { user_id: '5', username: 'user5', address: '0x5', preview_nfts: ['9', '10'] },
      { user_id: '6', username: 'user6', address: '0x6', preview_nfts: ['11', '12'] },
      { user_id: '7', username: 'user7', address: '0x7', preview_nfts: ['13', '14'] },
      { user_id: '8', username: 'user8', address: '0x8', preview_nfts: ['15', '16'] },
      { user_id: '9', username: 'user9', address: '0x9', preview_nfts: ['17', '18'] },
      { user_id: '10', username: 'user10', address: '0x10', preview_nfts: ['19', '20'] },
      { user_id: '11', username: 'user11', address: '0x11', preview_nfts: ['21', '22'] },
      { user_id: '12', username: 'user12', address: '0x12', preview_nfts: ['23', '24'] },
      { user_id: '13', username: 'user13', address: '0x13', preview_nfts: ['25', '26'] },
      { user_id: '14', username: 'user14', address: '0x14', preview_nfts: ['27', '28'] },
      { user_id: '15', username: 'user15', address: '0x15', preview_nfts: ['29', '30'] },
      { user_id: '16', username: 'user16', address: '0x16', preview_nfts: ['31', '32'] },
      { user_id: '17', username: 'user17', address: '0x17', preview_nfts: ['33', '34'] },
    ],
    asset_url: 'https://www.example.com/tier1.png',
    token_id: '3',
  },
] as MembershipTier[];

type GetMemberListResponse = {
  tiers: MembershipTier[];
};

export default function useMemberList(): MembershipTier[] {
  const data = useGet<GetMemberListResponse>(`/users/membership`, 'fetch member list');

  if (!data) {
    throw new Error('Error fetching member list');
  }

  return data.tiers;
}
