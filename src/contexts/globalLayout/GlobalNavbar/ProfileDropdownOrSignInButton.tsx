import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import { ProfileDropdownOrSignInButtonFragment$key } from '__generated__/ProfileDropdownOrSignInButtonFragment.graphql';
import { ReactNode } from 'react';
import { SignInButton } from 'contexts/globalLayout/GlobalNavbar/SignInButton';
import { ProfileDropdown } from 'contexts/globalLayout/GlobalNavbar/ProfileDropdown/ProfileDropdown';

type ProfileDropdownOrSignInButtonProps = {
  queryRef: ProfileDropdownOrSignInButtonFragment$key;
  profileRightContent?: ReactNode;
};

export function ProfileDropdownOrSignInButton({
  queryRef,
  profileRightContent,
}: ProfileDropdownOrSignInButtonProps) {
  const query = useFragment(
    graphql`
      fragment ProfileDropdownOrSignInButtonFragment on Query {
        viewer {
          ... on Viewer {
            __typename
          }
        }

        ...ProfileDropdownFragment
      }
    `,
    queryRef
  );

  if (query.viewer?.__typename === 'Viewer') {
    return <ProfileDropdown queryRef={query} rightContent={profileRightContent} />;
  } else {
    return <SignInButton />;
  }
}
