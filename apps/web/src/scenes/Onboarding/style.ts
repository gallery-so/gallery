import styled from 'styled-components';

import breakpoints from '~/components/core/breakpoints';
import { VStack } from '~/components/core/Spacer/Stack';

export const OnboardingContainer = styled(VStack).attrs({ gap: 16 })`
  width: auto;

  @media only screen and ${breakpoints.tablet} {
    width: 480px;
  }
`;
