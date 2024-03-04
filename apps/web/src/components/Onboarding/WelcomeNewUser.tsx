import { useCallback, useEffect, useState } from 'react';
import { graphql, useFragment } from 'react-relay';
import colors from 'shared/theme/colors';
import styled from 'styled-components';

import SidebarIcon from '~/contexts/globalLayout/GlobalSidebar/SidebarIcon';
import SidebarPfp from '~/contexts/globalLayout/GlobalSidebar/SidebarPfp';
import { useModalActions } from '~/contexts/modal/ModalContext';
import { WelcomeNewUserFragment$key } from '~/generated/WelcomeNewUserFragment.graphql';
import { WelcomeNewUserQueryFragment$key } from '~/generated/WelcomeNewUserQueryFragment.graphql';
import BellIcon from '~/icons/BellIcon';
import CogIcon from '~/icons/CogIcon';
import HomeIcon from '~/icons/HomeIcon';
import { PlusSquareIcon } from '~/icons/PlusSquareIcon';
import { QuestionMarkIcon } from '~/icons/QuestionMarkIcon';
import SearchIcon from '~/icons/SearchIcon';
import { useClearURLQueryParams } from '~/utils/useClearURLQueryParams';

import breakpoints from '../core/breakpoints';
import { HStack, VStack } from '../core/Spacer/Stack';
import { BaseS } from '../core/Text/Text';
import { WelcomeNewUserModal } from './WelcomeNewUserModal';

type Props = {
  queryRef: WelcomeNewUserFragment$key;
};

export function WelcomeNewUser({ queryRef }: Props) {
  const query = useFragment(
    graphql`
      fragment WelcomeNewUserFragment on Query {
        ...WelcomeNewUserQueryFragment
        viewer {
          ... on Viewer {
            user {
              username
            }
          }
        }
      }
    `,
    queryRef
  );

  const username = query?.viewer?.user?.username ?? '';

  useClearURLQueryParams(['onboarding']);

  // Step 1: Welcome message
  // Step 2: Post message
  // Step 3: Profile message
  const [step, setStep] = useState(1);

  const { showModal, hideModal } = useModalActions();

  const handleNextStep = useCallback(() => {
    setStep((prev) => prev + 1);
  }, []);

  useEffect(() => {
    if (step === 1) {
      showModal({
        content: (
          <WelcomeNewUserModal
            username={username}
            onContinue={() => {
              setStep(2);
              hideModal();
            }}
          />
        ),
        hideClose: true,
        onClose: () => {
          setStep(2);
        },
      });
      return;
    }
  }, [hideModal, showModal, step, username]);

  if (step > 3) {
    return null;
  }

  return (
    <StyledOverlay onClick={handleNextStep}>
      {(step === 2 || step === 3) && (
        <MockSidebar queryRef={query} onNextStep={handleNextStep} step={step} />
      )}
    </StyledOverlay>
  );
}

const StyledOverlay = styled.div`
  position: fixed;
  height: 100%;
  width: 100%;
  background-color: rgba(0, 0, 0, 0.4);
  z-index: 10;
  backdrop-filter: blur(4px);
  top: 0;
  left: 0;
`;

type MockSidebarProps = {
  queryRef: WelcomeNewUserQueryFragment$key;
  step: number;
  onNextStep: () => void;
};

function MockSidebar({ queryRef, onNextStep, step }: MockSidebarProps) {
  const query = useFragment(
    graphql`
      fragment WelcomeNewUserQueryFragment on Query {
        viewer {
          ... on Viewer {
            __typename
            user {
              ...SidebarPfpFragment
            }
          }
        }
      }
    `,
    queryRef
  );

  return (
    <MockSidebarContainer>
      <StyledStandardSidebar>
        <StyledIconContainer align="center" justify="space-between">
          <VStack gap={18}>
            {query.viewer?.__typename === 'Viewer' && query?.viewer?.user && (
              <SidebarPfp userRef={query.viewer.user} onClick={onNextStep} />
            )}
            {step === 2 && (
              <StyledTooltip gap={10} align="center" step="profile">
                <StyledTooltipText>This is where you can set up your own Gallery</StyledTooltipText>
                <StyledTooltipTextProgress>1/2</StyledTooltipTextProgress>
              </StyledTooltip>
            )}
          </VStack>
          <VStack gap={24}>
            <StyledSidebarIconContainer>
              <StyledSidebarIcon
                to={{ pathname: '/home' }}
                tooltipLabel="Home"
                onClick={onNextStep}
                icon={<HomeIcon />}
              />
            </StyledSidebarIconContainer>
            <div
              style={{
                position: 'relative',
              }}
            >
              <StyledSidebarIconContainer>
                <StyledSidebarIcon
                  tooltipLabel="Create a post"
                  onClick={onNextStep}
                  icon={<PlusSquareIcon />}
                />
              </StyledSidebarIconContainer>

              {step === 3 && (
                <StyledTooltip gap={10} align="center" step="post">
                  <StyledTooltipText>
                    Tap here to post an item from your collection
                  </StyledTooltipText>
                  <StyledTooltipTextProgress>2/2</StyledTooltipTextProgress>
                </StyledTooltip>
              )}
            </div>
            <StyledSidebarIconContainer>
              <StyledSidebarIcon tooltipLabel="Search" onClick={onNextStep} icon={<SearchIcon />} />
            </StyledSidebarIconContainer>
            <StyledSidebarIconContainer>
              <StyledSidebarIcon
                tooltipLabel="Notifications"
                onClick={onNextStep}
                icon={<BellIcon />}
              />
            </StyledSidebarIconContainer>
          </VStack>
          <VStack gap={24}>
            <StyledSidebarIconContainer>
              <StyledSidebarIcon tooltipLabel="Settings" onClick={onNextStep} icon={<CogIcon />} />
            </StyledSidebarIconContainer>
            <StyledSidebarIconContainer>
              <StyledSidebarIcon
                href="#"
                tooltipLabel="Support/FAQ"
                onClick={onNextStep}
                icon={<QuestionMarkIcon color={colors.black[800]} />}
              />
            </StyledSidebarIconContainer>
          </VStack>
        </StyledIconContainer>
      </StyledStandardSidebar>
    </MockSidebarContainer>
  );
}

const MockSidebarContainer = styled.div`
  height: 100vh;
  background: ${colors.white};
  width: 64px;
`;

const StyledStandardSidebar = styled.div`
  min-width: 100%;
  height: 100%;

  @media only screen and ${breakpoints.tablet} {
    padding: 16px 0;
  }
`;
const StyledSidebarIcon = styled(SidebarIcon)``;

const StyledSidebarIconContainer = styled(VStack)<{ active?: boolean }>`
  svg {
    opacity: ${({ active }) => (active ? 1 : 0.25)};
  }
`;

const StyledIconContainer = styled(VStack)`
  height: 100%;
`;

const StyledTooltip = styled(HStack)<{ step: 'profile' | 'post' }>`
  padding: 4px 8px;
  background: ${colors.white};
  border-radius: 1px;

  position: absolute;

  ${({ step }) =>
    step === 'profile'
      ? `
      top: 16px;
      left: 72px;
    `
      : `
      top: 0;
      left: 60px;
    `}

  width: max-content;

  /* transition: top 1s ease, left 1s ease; */
`;

const StyledTooltipText = styled(BaseS)`
  font-weight: 700;
`;

const StyledTooltipTextProgress = styled(BaseS)`
  color: ${colors.shadow};
`;
