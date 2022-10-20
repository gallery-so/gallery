import styled from 'styled-components';

type Props = {
  onClick: () => void;
};

export function BackButton({ onClick }: Props) {
  return (
    <StyledSvg
      onClick={onClick}
      role="button"
      width="32"
      height="32"
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="32" height="32" rx="1" fill="#FEFEFE" />
      <path d="M14.6667 11.3334L10 16L14.6667 20.6667" stroke="black" strokeMiterlimit="10" />
      <path d="M10 16H22.6667" stroke="black" strokeMiterlimit="10" />
    </StyledSvg>
  );
}

const StyledSvg = styled.svg`
  cursor: pointer;
`;
