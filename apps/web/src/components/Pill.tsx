import styled, { css } from 'styled-components';

import InteractiveLink from '~/components/core/InteractiveLink/InteractiveLink';
import colors from '~/shared/theme/colors';

export const ClickablePill = styled(InteractiveLink)<{ active?: boolean; className?: string }>`
  border: 1px solid ${colors.porcelain};
  padding: 0 12px;
  border-radius: 24px;
  color: ${colors.black['800']};
  text-decoration: none;
  width: fit-content;
  max-width: 100%;
  align-self: end;
  height: 32px;
  display: flex;
  align-items: center;

  ${({ active }) =>
    active &&
    css`
      border-color: ${colors.black['800']};
    `}

  &:hover {
    border-color: ${colors.black['800']};
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
  cursor: pointer;

  ${({ active }) =>
    active &&
    css`
      border-color: ${colors.black['800']};
    `}

  &:hover {
    border-color: ${colors.black['800']};
    background-color: ${colors.faint};
  }
`;

export const NonclickablePill = styled.div`
  color: ${colors.black['800']};
  width: fit-content;
  max-width: 100%;
  align-self: end;
  height: 32px;
  display: flex;
  align-items: center;
`;
