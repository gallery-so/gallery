import { MouseEventHandler, useCallback } from 'react';
import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import IconContainer from '~/components/core/IconContainer';
import { HStack } from '~/components/core/Spacer/Stack';
import transitions from '~/components/core/transitions';
import { ClickablePill } from '~/components/Pill';
import { NewTooltip } from '~/components/Tooltip/NewTooltip';
import { useTooltipHover } from '~/components/Tooltip/useTooltipHover';
import useUpdateTwitterDisplay from '~/components/Twitter/useUpdateTwitterDisplay';
import { TWITTER_AUTH_URL } from '~/constants/twitter';
import { useDrawerActions } from '~/contexts/globalLayout/GlobalSidebar/SidebarDrawerContext';
import { UserTwitterSectionFragment$key } from '~/generated/UserTwitterSectionFragment.graphql';
import { UserTwitterSectionQueryFragment$key } from '~/generated/UserTwitterSectionQueryFragment.graphql';
import { EditPencilIcon } from '~/icons/EditPencilIcon';
import GlobeIcon from '~/icons/GlobeIcon';
import LockIcon from '~/icons/LockIcon';
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
            display
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
        ...useUpdateTwitterDisplayFragment

        viewer {
          ... on Viewer {
            socialAccounts {
              twitter {
                username
                display
              }
            }
          }
        }
      }
    `,
    queryRef
  );

  const loggedInUserId = useLoggedInUserId(query);
  const isAuthenticatedUser = loggedInUserId === user.id;

  const updateTwitterDisplay = useUpdateTwitterDisplay(query);

  const { floating, reference, getFloatingProps, getReferenceProps, floatingStyle } =
    useTooltipHover({
      placement: 'top',
    });

  const { showDrawer } = useDrawerActions();

  const twitterAccount = user.socialAccounts?.twitter;

  const userLoggedInTwitterAccount = query.viewer?.socialAccounts?.twitter;

  const handleEditButtonClick = useCallback<MouseEventHandler>(
    (event) => {
      event.stopPropagation();
      showDrawer({
        content: <Settings queryRef={query} />,
      });
    },
    [query, showDrawer]
  );

  const handleUpdateTwitterDisplay = useCallback(() => {
    const display = !userLoggedInTwitterAccount?.display;
    updateTwitterDisplay(display);
  }, [updateTwitterDisplay, userLoggedInTwitterAccount?.display]);

  const twitterUrl = `https://twitter.com/${twitterAccount?.username}`;

  // if owner of the gallery is logged in
  if (isAuthenticatedUser && userLoggedInTwitterAccount) {
    return (
      <StyledTwitterContainer align="flex-start" gap={8}>
        <ClickablePill href={twitterUrl}>
          <HStack gap={5} align="center">
            <TwitterIcon />
            <strong>{userLoggedInTwitterAccount?.username}</strong>
          </HStack>
        </ClickablePill>

        <StyledActionContainer>
          <NewTooltip
            {...getFloatingProps()}
            style={floatingStyle}
            ref={floating}
            text={
              userLoggedInTwitterAccount?.display ? 'Visible to everyone' : 'Visible to only me'
            }
          />
          <IconContainer
            onClick={handleUpdateTwitterDisplay}
            size="md"
            variant="default"
            icon={userLoggedInTwitterAccount?.display ? <GlobeIcon /> : <LockIcon />}
            ref={reference}
            {...getReferenceProps()}
          />
          {isAuthenticatedUser && (
            <IconContainer
              onClick={handleEditButtonClick}
              size="md"
              variant="default"
              icon={<EditPencilIcon />}
            />
          )}
        </StyledActionContainer>
      </StyledTwitterContainer>
    );
  }

  if (isAuthenticatedUser && !userLoggedInTwitterAccount) {
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

  // Other users
  if (!twitterAccount?.display) {
    return null;
  }

  return (
    <HStack align="flex-start" gap={8}>
      <ClickablePill href={twitterUrl}>
        <HStack gap={5} align="center">
          <TwitterIcon />
          <strong>{twitterAccount.username}</strong>
        </HStack>
      </ClickablePill>
    </HStack>
  );
}

const StyledActionContainer = styled(HStack)`
  opacity: 0;
`;

const StyledTwitterContainer = styled(HStack)`
  max-width: max-content;

  &:hover ${StyledActionContainer} {
    opacity: 1;

    transition: opacity ${transitions.cubic};
  }
`;
