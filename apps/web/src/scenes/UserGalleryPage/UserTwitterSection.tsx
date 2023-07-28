import { graphql, useFragment } from 'react-relay';

import { HStack } from '~/components/core/Spacer/Stack';
import { ClickablePill } from '~/components/Pill';
import { TWITTER_AUTH_URL } from '~/constants/twitter';
import { UserTwitterSectionFragment$key } from '~/generated/UserTwitterSectionFragment.graphql';
import { UserTwitterSectionQueryFragment$key } from '~/generated/UserTwitterSectionQueryFragment.graphql';
import TwitterIcon from '~/icons/TwitterIcon';
import { useLoggedInUserId } from '~/shared/relay/useLoggedInUserId';

type Props = {
  queryRef: UserTwitterSectionQueryFragment$key;
  userRef: UserTwitterSectionFragment$key;
};

export default function UserTwitterSection({ queryRef, userRef }: Props) {
  const user = useFragment(
    graphql`
      fragment UserTwitterSectionFragment on GalleryUser {
        id
        socialAccounts {
          twitter {
            username
          }
        }
      }
    `,
    userRef
  );

  const query = useFragment(
    graphql`
      fragment UserTwitterSectionQueryFragment on Query {
        ...useLoggedInUserIdFragment
      }
    `,
    queryRef
  );

  const loggedInUserId = useLoggedInUserId(query);
  const isAuthenticatedUser = loggedInUserId === user.id;

  const userTwitterAccount = user.socialAccounts?.twitter;

  const twitterUrl = `https://twitter.com/${userTwitterAccount?.username}`;

  // logged in users without twitter connected should get the upsell button
  if (isAuthenticatedUser && !userTwitterAccount) {
    return (
      <HStack align="flex-start" gap={8}>
        <ClickablePill href={TWITTER_AUTH_URL} target="_self">
          <HStack gap={5} align="center">
            <TwitterIcon />
            <strong>Connect Twitter</strong>
          </HStack>
        </ClickablePill>
      </HStack>
    );
  }

  // twitter account is not connected
  if (!userTwitterAccount) {
    return null;
  }

  // twitter account is connected
  return (
    <HStack align="flex-start">
      <ClickablePill href={twitterUrl}>
        <HStack gap={5} align="center">
          <TwitterIcon />
          <strong>{userTwitterAccount.username}</strong>
        </HStack>
      </ClickablePill>
    </HStack>
  );
}
