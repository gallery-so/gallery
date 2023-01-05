import styled from 'styled-components';

import IconContainer from '~/components/core/Markdown/IconContainer';

type Props = {
  onClick: () => void;
};

export function BackButton({ onClick }: Props) {
  return (
    <IconContainer
      size="md"
      variant="default"
      onClick={onClick}
      icon={
        <StyledSvg
          role="button"
          width="32px"
          height="32px"
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M14.6667 11.3334L10 16L14.6667 20.6667"
            stroke="currentColor"
            strokeMiterlimit="10"
          />
          <path d="M10 16H22.6667" stroke="currentColor" strokeMiterlimit="10" />
        </StyledSvg>
      }
    />
  );
}

const StyledSvg = styled.svg`
  cursor: pointer;
`;
