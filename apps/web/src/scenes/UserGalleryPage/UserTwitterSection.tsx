import { useCallback } from 'react';
import { graphql, useFragment } from 'react-relay';

import IconContainer from '~/components/core/IconContainer';
import { HStack } from '~/components/core/Spacer/Stack';
import { ClickablePill } from '~/components/Pill';
import { NewTooltip } from '~/components/Tooltip/NewTooltip';
import { useTooltipHover } from '~/components/Tooltip/useTooltipHover';
import { useModalActions } from '~/contexts/modal/ModalContext';
import { UserTwitterSectionFragment$key } from '~/generated/UserTwitterSectionFragment.graphql';
import { EditPencilIcon } from '~/icons/EditPencilIcon';
import GlobeIcon from '~/icons/Globeicon';
import TwitterIcon from '~/icons/Twittericon';

import SettingsModal from '../Modals/SettingsModal/SettingsModal';

type Props = {
  queryRef: UserTwitterSectionFragment$key;
};

// TODO: Replace with real client id
const TWITTER_AUTH_URL =
  'https://twitter.com/i/oauth2/authorize?response_type=code&client_id=T0RhNDBVSWdVVGh2ZzBOdHJobHA6MTpjaQ&redirect_uri=http://localhost:3000/auth/twitter&scope=tweet.read%20users.read%20follows.read%20follows.write%20offline.access&state=state&code_challenge=challenge&code_challenge_method=plain';

export default function UserTwitterSection({ queryRef }: Props) {
  const query = useFragment(
    graphql`
      fragment UserTwitterSectionFragment on Query {
        viewer {
          ... on Viewer {
            user {
              socialAccounts {
                twitter {
                  username
                  display
                }
              }
            }
          }
        }

        ...SettingsModalFragment
      }
    `,
    queryRef
  );

  const { floating, reference, getFloatingProps, getReferenceProps, floatingStyle } =
    useTooltipHover({
      placement: 'top',
    });

  const { showModal } = useModalActions();

  const twitterAccount = query.viewer?.user?.socialAccounts?.twitter;

  const handleEditButtonClick = useCallback(() => {
    showModal({
      content: <SettingsModal queryRef={query} />,
      headerText: 'Settings',
    });
  }, [query, showModal]);

  return (
    <HStack align="flex-start" gap={8}>
      {twitterAccount && twitterAccount?.display ? (
        <>
          <ClickablePill href="https://twitter.com/0xJakz">
            <HStack gap={5} align="center">
              <TwitterIcon />
              <strong>{twitterAccount.username}</strong>
            </HStack>
          </ClickablePill>

          <HStack>
            <NewTooltip
              {...getFloatingProps()}
              style={floatingStyle}
              ref={floating}
              text="Visible to everyone"
            />
            <IconContainer
              size="md"
              variant="default"
              icon={<GlobeIcon />}
              ref={reference}
              {...getReferenceProps()}
            />
            <IconContainer
              onClick={handleEditButtonClick}
              size="md"
              variant="default"
              icon={<EditPencilIcon />}
            />
          </HStack>
        </>
      ) : (
        <ClickablePill href={TWITTER_AUTH_URL}>
          <HStack gap={5} align="center">
            <TwitterIcon />
            <strong>Connect Twitter</strong>
          </HStack>
        </ClickablePill>
      )}
    </HStack>
  );
}
