import { ButtonHTMLAttributes } from 'react';
import styled from 'styled-components';

import InteractiveLink, {
  InteractiveLinkProps,
} from '~/components/core/InteractiveLink/InteractiveLink';
import colors from '~/shared/theme/colors';

type GalleryPillProps = {
  active?: boolean;
  className?: string;
  clickDisabled?: boolean;
} & InteractiveLinkProps &
  ButtonHTMLAttributes<HTMLButtonElement> & {
    disabled?: boolean;
  };

/**
 * This component will either render an InteractiveLink for redirects,
 * or a simple Button
 */
export function GalleryPill(props: GalleryPillProps) {
  if (props.to || props.href) {
    return <GalleryPillLink {...props} />;
  }

  return <GalleryPillButton {...props} />;
}

type StyledComponentProps = {
  active?: boolean;
  clickDisabled?: boolean;
};

const sharedStyles = ({ active, clickDisabled }: StyledComponentProps) => `
  border: 1px solid ${colors.porcelain};
  background-color: ${colors.white};
  padding: 0 12px;
  border-radius: 24px;
  color: ${colors.black['800']};
  text-decoration: none;
  width: fit-content;
  max-width: 100%;
  height: 32px;
  display: flex;
  align-items: center;
  cursor: pointer;

  &:hover {
    border-color: ${clickDisabled ? colors.porcelain : colors.black['800']};
  }

  ${active ? `border-color: ${colors.black['800']};` : ''}
`;

export const GalleryPillLink = styled(InteractiveLink)<StyledComponentProps>`
  ${(props) => sharedStyles(props)}
`;

export const GalleryPillButton = styled.button<StyledComponentProps>`
  ${(props) => sharedStyles(props)}
`;
