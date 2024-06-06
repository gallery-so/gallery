import { motion } from 'framer-motion';
import { ReactNode, useEffect } from 'react';
import colors from 'shared/theme/colors';
import styled from 'styled-components';

import { FOOTER_HEIGHT, StepName } from '~/components/Onboarding/constants';
import { useProgress } from '~/contexts/onboardingProgress';
import GalleryRoute from '~/scenes/_Router/GalleryRoute';

import { ANIMATED_COMPONENT_TRANSITION_S, rawTransitions } from '../core/transitions';

type Props = {
  children: ReactNode | ReactNode[];
  withFooter?: boolean;
  stepName: StepName;
};

/**
 * A helper component to easily generate full-page steps where the content is centered
 */
export default function FullPageCenteredStep({ children, withFooter, stepName }: Props) {
  const { to, setProgress } = useProgress();

  useEffect(() => {
    setProgress(stepName);
  }, [setProgress, stepName]);

  return (
    <GalleryRoute
      element={
        <StyledPage withFooter={withFooter}>
          <OnboardingProgressBar to={to} />
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
  to: number;
};

function OnboardingProgressBar({ to }: OnboardingProgressBarProps) {
  return (
    <StyledBar
      initial={{ width: `${to}%` }}
      animate={{ width: `${to}%` }}
      transition={{
        duration: ANIMATED_COMPONENT_TRANSITION_S,
        ease: rawTransitions.cubicValues,
      }}
    />
  );
}

const StyledBar = styled(motion.div)`
  height: 8px;
  background-color: ${colors.activeBlue};
  position: absolute;
  top: 0;
  left: 0;
  border-bottom-right-radius: 4px;
`;
