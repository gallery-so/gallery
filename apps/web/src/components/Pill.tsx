import styled from 'styled-components';

import colors from '~/components/core/colors';
import InteractiveLink from '~/components/core/InteractiveLink/InteractiveLink';

export const ClickablePill = styled(InteractiveLink)`
  border: 1px solid ${colors.porcelain};
  padding: 0 12px;
  border-radius: 24px;
  color: ${colors.offBlack};
  text-decoration: none;
  width: fit-content;
  max-width: 100%;
  align-self: end;
  height: 32px;
  display: flex;
  align-items: center;

  &:hover {
    background: ${colors.porcelain};
    backdrop-filter: blur(10px);
    border-color: transparent;
  }
`;

export const NonclickablePill = styled.div`
  color: ${colors.offBlack};
  width: fit-content;
  max-width: 100%;
  align-self: end;
  height: 32px;
  display: flex;
  align-items: center;
`;
