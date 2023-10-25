import { ButtonHTMLAttributes, MouseEventHandler, useCallback } from 'react';
import styled, { css } from 'styled-components';

import { GalleryElementTrackingProps, useTrack } from '~/shared/contexts/AnalyticsContext';

import { TitleXSBold } from '../Text/Text';

type GalleryChipProps = {
  className?: string;
  disabled?: boolean;
} & ButtonHTMLAttributes<HTMLButtonElement> &
  GalleryElementTrackingProps;

export function GalleryChip(props: GalleryChipProps) {
  const track = useTrack();

  const { eventElementId, eventName, eventContext, eventFlow, properties, onClick } = props;

  const handleClick = useCallback<MouseEventHandler<HTMLButtonElement>>(
    (event) => {
      track('Chip Click', {
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

  return (
    <Chip
      {...props}
      // @ts-expect-error: this component is adopting the `button` role
      onClick={handleClick}
    />
  );
}

const Chip = styled(TitleXSBold).attrs({ role: 'button' })<{ disabled?: boolean }>`
  display: flex;
  justify-content: center;
  align-items: center;

  padding: 2px 4px;
  cursor: pointer;

  height: 20px;
  line-height: 1;

  border-radius: 2px;

  white-space: nowrap;

  ${({ disabled }) =>
    disabled
      ? css`
          pointer-events: none;
          cursor: default;
        `
      : null};
`;
