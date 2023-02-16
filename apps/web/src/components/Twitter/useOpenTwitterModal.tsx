import { useRouter } from 'next/router';
import { useCallback, useEffect, useRef } from 'react';
import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import { TWITTER_AUTH_URL } from '~/constants/twitter';
import { useModalActions } from '~/contexts/modal/ModalContext';
import { useOpenTwitterModalFragment$key } from '~/generated/useOpenTwitterModalFragment.graphql';

import breakpoints from '../core/breakpoints';
import { Button } from '../core/Button/Button';
import InteractiveLink from '../core/InteractiveLink/InteractiveLink';
import { HStack } from '../core/Spacer/Stack';
import { TitleDiatypeL } from '../core/Text/Text';

export default function useOpenTwitterModal(queryRef: useOpenTwitterModalFragment$key) {
  const query = useFragment(
    graphql`
      fragment useOpenTwitterModalFragment on Query {
        viewer {
          __typename
        }
      }
    `,
    queryRef
  );

  const router = useRouter();
  const { showModal, hideModal } = useModalActions();

  const { query: routerQuery } = router;
  const { onboarding } = routerQuery;

  const isLoggedIn = query.viewer?.__typename === 'Viewer';

  const isTwitterModalOpen = useRef(false);

  const handleClose = useCallback(() => {
    hideModal();
  }, [hideModal]);

  useEffect(() => {
    if (!isLoggedIn) {
      return;
    }

    if (onboarding === 'true' && !isTwitterModalOpen.current) {
      isTwitterModalOpen.current = true;
      showModal({
        content: (
          <StyledOnboardingTwitterModal>
            <StyledBodyTextContainer>
              <TitleDiatypeL>Lastly, find your Twitter friends on Gallery</TitleDiatypeL>
            </StyledBodyTextContainer>

            <HStack justify="flex-end" gap={10}>
              <Button onClick={handleClose} variant="secondary">
                SKIP
              </Button>
              <StyledConnectLink href={TWITTER_AUTH_URL} target="_self">
                <Button variant="primary">CONNECT</Button>
              </StyledConnectLink>
            </HStack>
          </StyledOnboardingTwitterModal>
        ),
      });
    }
  }, [handleClose, isLoggedIn, onboarding, showModal]);
}

const StyledOnboardingTwitterModal = styled.div`
  width: 300px;

  @media only screen and ${breakpoints.tablet} {
    width: 375px;
  }
`;

const StyledBodyTextContainer = styled.div`
  padding: 48px 0 24px;
`;

const StyledConnectLink = styled(InteractiveLink)`
  text-decoration: none;
`;
