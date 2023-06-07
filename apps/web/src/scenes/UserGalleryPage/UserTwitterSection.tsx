import { MouseEventHandler, useCallback } from 'react';
import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import IconContainer from '~/components/core/IconContainer';
import { HStack } from '~/components/core/Spacer/Stack';
import { ClickablePill } from '~/components/Pill';
import { TWITTER_AUTH_URL } from '~/constants/twitter';
import { useDrawerActions } from '~/contexts/globalLayout/GlobalSidebar/SidebarDrawerContext';
import { UserTwitterSectionFragment$key } from '~/generated/UserTwitterSectionFragment.graphql';
import { UserTwitterSectionQueryFragment$key } from '~/generated/UserTwitterSectionQueryFragment.graphql';
import { EditPencilIcon } from '~/icons/EditPencilIcon';
import TwitterIcon from '~/icons/TwitterIcon';
import { useLoggedInUserId } from '~/shared/relay/useLoggedInUserId';

import Settings from '../../components/Settings/Settings';

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
        ...SettingsFragment
        ...useLoggedInUserIdFragment
      }
    `,
    queryRef
  );

  const loggedInUserId = useLoggedInUserId(query);
  const isAuthenticatedUser = loggedInUserId === user.id;

  const { showDrawer } = useDrawerActions();

  const userTwitterAccount = user.socialAccounts?.twitter;

  const handleEditButtonClick = useCallback<MouseEventHandler>(
    (event) => {
      event.stopPropagation();
      showDrawer({
        content: <Settings queryRef={query} />,
      });
    },
    [query, showDrawer]
  );

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
    <HStack align="flex-start" gap={8}>
      <ClickablePill href={twitterUrl}>
        <HStack gap={5} align="center">
          <TwitterIcon />
          <strong>{userTwitterAccount.username}</strong>
        </HStack>
      </ClickablePill>

      {isAuthenticatedUser && (
        <StyledActionContainer>
          <IconContainer
            onClick={handleEditButtonClick}
            size="md"
            variant="default"
            icon={<EditPencilIcon />}
          />
        </StyledActionContainer>
      )}
    </HStack>
  );
}

const StyledActionContainer = styled(HStack)`
  opacity: 0;
`;
