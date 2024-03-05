import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import colors from 'shared/theme/colors';
import styled from 'styled-components';

import {
  FOOTER_HEIGHT,
  ONBOARDING_PROGRESS_BAR_STEPS,
  StepName,
} from '~/components/Onboarding/constants';
import GalleryRoute from '~/scenes/_Router/GalleryRoute';

import { ANIMATED_COMPONENT_TRANSITION_S, rawTransitions } from '../core/transitions';

type Props = {
  children: ReactNode | ReactNode[];
  // If this is true, the page height will be reduced to account for the footer height
  withFooter?: boolean;
  stepName: StepName;
};

/**
 * A helper component to easily generate full-page steps where the content is centered
 */
export default function FullPageCenteredStep({ children, withFooter, stepName }: Props) {
  const { from, to } = ONBOARDING_PROGRESS_BAR_STEPS[stepName] ?? { from: 0, to: 0 };

  return (
    <GalleryRoute
      element={
        <StyledPage withFooter={withFooter}>
          <OnboardingProgressBar from={from} to={to} />
          {children}
        </StyledPage>
      }
      navbar={false}
      footer={false}
    />
  );
}

const StyledPage = styled.div<{ withFooter?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: calc(100vh - ${({ withFooter }) => (withFooter ? FOOTER_HEIGHT : 0)}px);
  position: relative;
`;

type OnboardingProgressBarProps = {
  from: number;
  to: number;
};

function OnboardingProgressBar({ from, to }: OnboardingProgressBarProps) {
  return (
    <StyledBar
      initial={{ width: from }}
      animate={{ width: `${to}%` }}
      transition={{
        duration: ANIMATED_COMPONENT_TRANSITION_S,
        ease: rawTransitions.cubicValues,
      }}
    />
  );
}

const StyledBar = styled(motion.div)`
  height: 12px;
  background-color: ${colors.activeBlue};
  position: absolute;
  top: 0;
  left: 0;
  border-bottom-right-radius: 8px;
`;
