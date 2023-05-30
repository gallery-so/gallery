import Link from 'next/link';
import { Route } from 'nextjs-routes';
import { MouseEvent, useCallback } from 'react';
import styled from 'styled-components';

import breakpoints from '~/components/core/breakpoints';
import IconContainer from '~/components/core/IconContainer';
import { NewTooltip } from '~/components/Tooltip/NewTooltip';
import { useTooltipHover } from '~/components/Tooltip/useTooltipHover';
import colors from '~/shared/theme/colors';

type Props = {
  onClick: () => void;
  icon: React.ReactElement;
  isActive?: boolean;
  tooltipLabel: string;
  showUnreadDot?: boolean;
  showBorderByDefault?: boolean;
  href?: Route;
  dataTestId?: string;
};
export default function SidebarIcon({
  onClick,
  icon,
  isActive = false,
  tooltipLabel,
  showUnreadDot = false,
  showBorderByDefault = false,
  href,
  dataTestId,
}: Props) {
  const { floating, reference, getFloatingProps, getReferenceProps, floatingStyle, close } =
    useTooltipHover({ placement: 'right' });

  const handleClick = useCallback(
    (e: MouseEvent) => {
      e.stopPropagation();
      onClick();
      close();
    },
    [close, onClick]
  );

  const content = (
    <>
      {showUnreadDot && <StyledUnreadDot />}
      <StyledIconContainer
        {...getReferenceProps()}
        ref={reference}
        variant="default"
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
    </>
  );

  if (href) {
    return (
      <IconWrapper data-test-id={dataTestId} onClick={handleClick}>
        <Link href={href}>{content}</Link>
      </IconWrapper>
    );
  }

  return <IconWrapper onClick={handleClick}>{content}</IconWrapper>;
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
