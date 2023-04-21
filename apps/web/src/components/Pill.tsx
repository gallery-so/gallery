import styled, { css } from 'styled-components';

import colors from '~/components/core/colors';
import InteractiveLink from '~/components/core/InteractiveLink/InteractiveLink';

export const ClickablePill = styled(InteractiveLink)<{ active?: boolean }>`
  border: 1px solid ${colors.porcelain};
  padding: 0 12px;
  border-radius: 24px;
  color: ${colors.offBlack};
  text-decoration: none;
  width: fit-content;
  max-width: 100%;
  /* align-self: end; */
  height: 32px;
  display: flex;
  align-items: center;

  ${({ active }) =>
    active &&
    css`
      border-color: ${colors.offBlack};
    `}

  &:hover {
    border-color: ${colors.offBlack};
  }
`;

export const ButtonPill = styled.button<{ active?: boolean }>`
  border: 1px solid ${colors.porcelain};
  padding: 0 12px;
  border-radius: 24px;
  color: ${colors.shadow};
  text-decoration: none;
  width: fit-content;
  max-width: 100%;
  align-self: end;
  height: 32px;
  display: flex;
  align-items: center;
  background-color: ${colors.offWhite};

  ${({ active }) =>
    active &&
    css`
      border-color: ${colors.offBlack};
    `}

  &:hover {
    border-color: ${colors.offBlack};
    background-color: ${colors.faint};
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
