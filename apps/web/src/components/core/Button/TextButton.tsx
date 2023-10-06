import { MouseEventHandler, useCallback } from 'react';
import styled from 'styled-components';

import { GalleryElementTrackingProps, useTrack } from '~/shared/contexts/AnalyticsContext';
import colors from '~/shared/theme/colors';

import ActionText from '../ActionText/ActionText';

type Props = {
  className?: string;
  text: string;
  // TODO: Refactor to support more than MouseEvent
  onClick?: (event: React.MouseEvent<HTMLElement>) => void;
  underlineOnHover?: boolean;
  disableTextTransform?: boolean;
  disabled?: boolean;
  dataTestId?: string;
} & GalleryElementTrackingProps;

function TextButton({
  className,
  text,
  onClick,
  disableTextTransform = false,
  disabled,
  dataTestId,
  eventElementId,
  eventName,
  eventContext,
  properties,
}: Props) {
  const track = useTrack();
  const handleClick = useCallback<MouseEventHandler<HTMLButtonElement>>(
    (event) => {
      track('Button Click', {
        id: eventElementId,
        name: eventName,
        context: eventContext,
        ...properties,
      });

      onClick?.(event);
    },
    [eventContext, eventElementId, eventName, onClick, properties, track]
  );

  return (
    <StyledButton
      className={className}
      onClick={handleClick}
      disabled={disabled}
      data-testid={dataTestId}
    >
      <StyledButtonText disableTextTransform={disableTextTransform} disabled={disabled}>
        {text}
      </StyledButtonText>
    </StyledButton>
  );
}

export const StyledButtonText = styled(ActionText)<Pick<Props, 'disableTextTransform'>>`
  text-transform: ${({ disableTextTransform }) => (disableTextTransform ? 'none' : undefined)};
`;

export const StyledButton = styled.button<Pick<Props, 'underlineOnHover' | 'disabled'>>`
  padding: 0;
  border-style: none;
  cursor: pointer;
  background: none;
  text-align: left;

  pointer-events: ${({ disabled }) => (disabled ? 'none' : 'inherit')};

  &:hover ${StyledButtonText} {
    color: ${colors.black['800']};
  }
`;

export default TextButton;
