import { graphql, useFragment } from 'react-relay';

import { HStack } from '~/components/core/Spacer/Stack';
import { GalleryPill } from '~/components/GalleryPill';
import { TWITTER_AUTH_URL } from '~/constants/twitter';
import { UserTwitterSectionFragment$key } from '~/generated/UserTwitterSectionFragment.graphql';
import { UserTwitterSectionQueryFragment$key } from '~/generated/UserTwitterSectionQueryFragment.graphql';
import TwitterIcon from '~/icons/TwitterIcon';
import { contexts, flows } from '~/shared/analytics/constants';
import { useLoggedInUserId } from '~/shared/relay/useLoggedInUserId';

import UserSocialPill from './UserSocialPill';

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
        <GalleryPill
          eventElementId="Connect Twitter Pill"
          eventName="Connect Twitter"
          eventContext={contexts['External Social']}
          eventFlow={flows.Twitter}
          href={TWITTER_AUTH_URL}
          target="_self"
        >
          <HStack gap={5} align="center">
            <TwitterIcon />
            <strong>Connect Twitter</strong>
          </HStack>
        </GalleryPill>
      </HStack>
    );
  }

  // twitter account is not connected
  if (!userTwitterAccount) {
    return null;
  }

  // twitter account is connected
  return (
    <UserSocialPill
      url={twitterUrl}
      icon={<TwitterIcon />}
      username={userTwitterAccount.username}
      platform="twitter"
    />
  );
}
