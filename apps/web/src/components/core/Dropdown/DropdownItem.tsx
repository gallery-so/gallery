import { ComponentProps, MouseEventHandler, useCallback } from 'react';
import styled from 'styled-components';

import { TrashIconNew } from '~/icons/TrashIconNew';
import { GalleryElementTrackingProps, useTrack } from '~/shared/contexts/AnalyticsContext';
import colors from '~/shared/theme/colors';

import { HStack } from '../Spacer/Stack';
import { BaseM } from '../Text/Text';

export type DropdownEventProps = {
  // used for event tracking
  name: string;
  eventSelection?: string;
  // if provided, will render a label using default styling
  label?: string;
  variant?: 'default' | 'delete';
} & Omit<GalleryElementTrackingProps, 'eventElementId' | 'eventName'>;

type DropdownItemProps = {
  disabled?: boolean;
} & ComponentProps<'div'> &
  DropdownEventProps;

export function DropdownItem({
  disabled,
  onClick,
  label,
  variant = 'default',
  name,
  eventContext,
  eventFlow,
  eventSelection,
  properties,
  children,
}: DropdownItemProps) {
  const track = useTrack();

  const handleClick = useCallback<MouseEventHandler<HTMLDivElement>>(
    (event) => {
      if (disabled) {
        return;
      }
      track('Dropdown Item Click', {
        id: `${name} Dropdown Item`,
        name: `${name} Dropdown Item Click`,
        context: eventContext,
        flow: eventFlow,
        selection: label || eventSelection,
        ...properties,
      });

      onClick?.(event);
    },
    [track, name, eventContext, eventFlow, label, eventSelection, properties, onClick]
  );

  if (label) {
    return (
      <StyledDropdownItem disabled={disabled} onClick={handleClick}>
        <HStack gap={4} align="center">
          {variant === 'delete' ? <TrashIconNew color={colors.error} /> : null}
          <BaseM color={variant === 'delete' ? colors.error : undefined}>{label}</BaseM>
        </HStack>
      </StyledDropdownItem>
    );
  }

  return (
    <StyledDropdownItem disabled={disabled} onClick={handleClick}>
      {children}
    </StyledDropdownItem>
  );
}

const StyledDropdownItem = styled.div<{ disabled?: boolean }>`
  padding: 8px;

  font-family: 'Helvetica Neue';
  font-style: normal;
  font-weight: 400;
  font-size: 12px;
  line-height: 16px;
  width: 100%;

  color: ${({ disabled }) => (disabled ? '#c2c2c2' : colors.shadow)};
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  opacity: ${({ disabled }) => (disabled ? 0.35 : 1)};

  white-space: nowrap;

  &:hover {
    color: ${({ disabled }) => (disabled ? '#c2c2c2' : colors.black['800'])};
    background-color: ${({ disabled }) => (disabled ? colors.faint : colors.faint)};
  }
`;
