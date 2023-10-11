import { ButtonHTMLAttributes, MouseEventHandler, useCallback } from 'react';
import styled from 'styled-components';

import GalleryLink, { GalleryLinkProps } from '~/components/core/GalleryLink/GalleryLink';
import { GalleryElementTrackingProps, useTrack } from '~/shared/contexts/AnalyticsContext';
import colors from '~/shared/theme/colors';

type GalleryPillProps = {
  active?: boolean;
  className?: string;
  disabled?: boolean;
} & GalleryLinkProps &
  ButtonHTMLAttributes<HTMLButtonElement> &
  GalleryElementTrackingProps;

/**
 * This component will either render an GalleryLink for redirects,
 * or a simple Button
 */
export function GalleryPill(props: GalleryPillProps) {
  const track = useTrack();

  const { to, href, eventElementId, eventName, eventContext, eventFlow, properties, onClick } =
    props;

  const handleClick = useCallback<MouseEventHandler<HTMLButtonElement>>(
    (event) => {
      track('Pill Click', {
        id: eventElementId,
        name: eventName,
        context: eventContext,
        flow: eventFlow,
        ...properties,
      });

      onClick?.(event);
    },
    [eventContext, eventElementId, eventFlow, eventName, onClick, properties, track]
  );

  if (to || href) {
    return <GalleryPillLink {...props} onClick={handleClick} />;
  }

  return <GalleryPillButton {...props} onClick={handleClick} />;
}

type StyledComponentProps = {
  active?: boolean;
  disabled?: boolean;
};

const sharedStyles = ({ active, disabled }: StyledComponentProps) => `
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
    border-color: ${disabled ? colors.porcelain : colors.black['800']};
  }

  ${active ? `border-color: ${colors.black['800']};` : ''}
`;

const GalleryPillLink = styled(GalleryLink)<StyledComponentProps>`
  ${(props) => sharedStyles(props)}
`;

const GalleryPillButton = styled.button<StyledComponentProps>`
  ${(props) => sharedStyles(props)}
`;
