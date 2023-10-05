import { graphql, useFragment } from 'react-relay';

import { CommunityProfilePictureFragment$key } from '~/generated/CommunityProfilePictureFragment.graphql';

import { RawProfilePicture, RawProfilePictureProps } from './RawProfilePicture';

type Props = {
  communityRef: CommunityProfilePictureFragment$key;
} & Omit<RawProfilePictureProps, 'imageUrl'>;

export default function CommunityProfilePicture({ communityRef, ...rest }: Props) {
  const community = useFragment(
    graphql`
      fragment CommunityProfilePictureFragment on Community {
        name
        contractAddress {
          address
        }
        profileImageURL
      }
    `,
    communityRef
  );

  const imageUrl = community?.profileImageURL;
  if (imageUrl) {
    return <RawProfilePicture imageUrl={imageUrl} {...rest} />;
  }

  const firstLetter =
    community?.name?.[0]?.toUpperCase() || community?.contractAddress?.address?.[0]?.toUpperCase();
  return <RawProfilePicture letter={firstLetter ?? ''} {...rest} />;
}
