import styled, { keyframes } from 'styled-components';

import { CapitalG } from '~/icons/CapitalG';

import { TitleL } from '../Text/Text';

export default function CapitalGLoader() {
  return (
    <AnimatedDisplay>
      <CapitalG />
    </AnimatedDisplay>
  );
}

const fade = keyframes`
    from { opacity: 0.1 }
    to { opacity: 1 }
`;

const AnimatedDisplay = styled(TitleL)`
  animation: ${fade} 800ms cubic-bezier(0, 0, 0.4, 1) infinite;
  animation-direction: alternate;
`;
