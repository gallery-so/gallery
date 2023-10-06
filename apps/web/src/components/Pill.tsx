import { ButtonHTMLAttributes } from 'react';
import styled from 'styled-components';

import InteractiveLink, {
  InteractiveLinkProps,
} from '~/components/core/InteractiveLink/InteractiveLink';
import colors from '~/shared/theme/colors';

type GalleryPillProps = {
  active?: boolean;
  className?: string;
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

const sharedStyles = ({ active }: { active?: boolean }) => `
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
    border-color: ${colors.black['800']};
  }

  ${active ? `border-color: ${colors.black['800']};` : ''}
`;

export const GalleryPillLink = styled(InteractiveLink)<{ active?: boolean }>`
  ${({ active }) => sharedStyles({ active })}
`;

export const GalleryPillButton = styled.button<{ active?: boolean }>`
  ${({ active }) => sharedStyles({ active })}
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
