import { useCallback } from 'react';
import styled from 'styled-components';

import breakpoints from '~/components/core/breakpoints';
import colors from '~/components/core/colors';
import IconContainer from '~/components/core/IconContainer';
import { NewTooltip } from '~/components/Tooltip/NewTooltip';
import { useTooltipHover } from '~/components/Tooltip/useTooltipHover';

type Props = {
  onClick: () => void;
  icon: React.ReactElement;
  isActive?: boolean;
  tooltipLabel: string;
  showUnreadDot?: boolean;
  showBorderByDefault?: boolean;
};
export default function SidebarIcon({
  onClick,
  icon,
  isActive = false,
  tooltipLabel,
  showUnreadDot = false,
  showBorderByDefault = false,
}: Props) {
  const { floating, reference, getFloatingProps, getReferenceProps, floatingStyle } =
    useTooltipHover({ placement: 'right' });

  const handleClick = useCallback(
    (e) => {
      e.stopPropagation();
      onClick();
    },
    [onClick]
  );

  return (
    <IconWrapper>
      {showUnreadDot && <StyledUnreadDot />}
      <StyledIconContainer
        {...getReferenceProps()}
        ref={reference}
        variant="default"
        onClick={handleClick}
        icon={icon}
        isActive={isActive}
        showBorderByDefault={showBorderByDefault}
      />
      <StyledTooltip
        {...getFloatingProps()}
        style={floatingStyle}
        ref={floating}
        text={tooltipLabel}
      />
    </IconWrapper>
  );
}

const StyledIconContainer = styled(IconContainer)<{
  isActive: boolean;
  showBorderByDefault: boolean;
}>`
  ${({ isActive }) => isActive && `border: 1px solid ${colors.offBlack}`};
  ${({ showBorderByDefault }) => showBorderByDefault && `border: 1px solid ${colors.porcelain}`};
`;

const IconWrapper = styled.div`
  position: relative;
`;

const StyledUnreadDot = styled.div`
  width: 10px;
  height: 10px;
  background-color: ${colors.hyperBlue};
  align-self: flex-start;
  position: absolute;
  left: 18px;
  top: 4px;
  z-index: 5;
  border: 2px solid ${colors.white};
  border-radius: 99999px;
`;

const StyledTooltip = styled(NewTooltip)`
  display: none;
  @media only screen and ${breakpoints.tablet} {
    display: block;
  }
`;
