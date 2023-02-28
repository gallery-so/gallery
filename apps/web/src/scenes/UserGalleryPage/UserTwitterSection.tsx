import { useCallback } from 'react';
import { graphql, useFragment } from 'react-relay';

import IconContainer from '~/components/core/IconContainer';
import { HStack } from '~/components/core/Spacer/Stack';
import { ClickablePill } from '~/components/Pill';
import { NewTooltip } from '~/components/Tooltip/NewTooltip';
import { useTooltipHover } from '~/components/Tooltip/useTooltipHover';
import { TWITTER_AUTH_URL } from '~/constants/twitter';
import { useModalActions } from '~/contexts/modal/ModalContext';
import { UserTwitterSectionFragment$key } from '~/generated/UserTwitterSectionFragment.graphql';
import { UserTwitterSectionQueryFragment$key } from '~/generated/UserTwitterSectionQueryFragment.graphql';
import { useLoggedInUserId } from '~/hooks/useLoggedInUserId';
import { EditPencilIcon } from '~/icons/EditPencilIcon';
import GlobeIcon from '~/icons/Globeicon';
import LockIcon from '~/icons/LockIcon';
import TwitterIcon from '~/icons/Twittericon';

import SettingsModal from '../Modals/SettingsModal/SettingsModal';

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
        ...SettingsModalFragment
        ...useLoggedInUserIdFragment

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

  const { floating, reference, getFloatingProps, getReferenceProps, floatingStyle } =
    useTooltipHover({
      placement: 'top',
    });

  const { showModal } = useModalActions();

  const twitterAccount = user.socialAccounts?.twitter;

  const userLoggedInTwitterAccount = query.viewer?.socialAccounts?.twitter;

  const handleEditButtonClick = useCallback(() => {
    showModal({
      content: <SettingsModal queryRef={query} />,
      headerText: 'Settings',
    });
  }, [query, showModal]);

  const twitterUrl = `https://twitter.com/${twitterAccount?.username}`;

  // if owner of the gallery is logged in
  if (isAuthenticatedUser && userLoggedInTwitterAccount) {
    return (
      <HStack align="flex-start" gap={8}>
        <ClickablePill href={twitterUrl}>
          <HStack gap={5} align="center">
            <TwitterIcon />
            <strong>{userLoggedInTwitterAccount?.username}</strong>
          </HStack>
        </ClickablePill>

        <HStack>
          <NewTooltip
            {...getFloatingProps()}
            style={floatingStyle}
            ref={floating}
            text={
              userLoggedInTwitterAccount?.display ? 'Visible to everyone' : 'Visible to only me'
            }
          />
          <IconContainer
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
        </HStack>
      </HStack>
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
