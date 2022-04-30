import React from 'react';
import styled from 'styled-components';

export function Bold({ onClick }: { onClick: () => void }) {
  return (
    <IconContainer
      icon={
        <svg
          onClick={onClick}
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect width="24" height="24" />
          <path
            d="M14.7277 7.24799C14.1566 6.76028 13.3771 6.5251 12.4068 6.5251H8.6001H8.5251V6.6001V17.0001V17.0751H8.6001H12.5241C13.5627 17.0751 14.3919 16.8252 14.9927 16.3073L14.9927 16.3073C15.6038 15.7791 15.9071 15.0735 15.9071 14.2054C15.9071 13.5163 15.6797 12.9155 15.226 12.41C14.8815 12.0177 14.4477 11.7329 13.9284 11.5541C14.3825 11.374 14.754 11.1156 15.0381 10.7764C15.4137 10.3277 15.5991 9.78115 15.5991 9.14543C15.5991 8.37169 15.3079 7.7352 14.7277 7.24799ZM9.33643 7.29243H12.4068C13.1778 7.29243 13.7577 7.4738 14.164 7.8169L14.164 7.8169L14.1648 7.81753C14.5703 8.15097 14.7731 8.58907 14.7731 9.14543C14.7731 9.76305 14.5585 10.2509 14.1323 10.6227L14.1323 10.6227L14.1317 10.6232C13.7151 10.9945 13.1311 11.1891 12.3628 11.1891H9.33643V7.29243ZM9.33643 11.9564H12.3628C13.1789 11.9564 13.8294 12.1648 14.3266 12.5699L14.3271 12.5703C14.8289 12.9718 15.0811 13.512 15.0811 14.2054C15.0811 14.8751 14.8644 15.3857 14.441 15.7554C14.0166 16.1163 13.3851 16.3078 12.5241 16.3078H9.33643V11.9564Z"
            fill="#141414"
            stroke="black"
            stroke-width="0.15"
          />
        </svg>
      }
    />
  );
}

export function List({ onClick }: { onClick: () => void }) {
  return (
    <IconContainer
      icon={
        <svg
          onClick={onClick}
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect width="24" height="24" />
          <path d="M9.66669 8.5H17.25" stroke="#141414" stroke-miterlimit="10" />
          <path d="M9.66669 12H17.25" stroke="#141414" stroke-miterlimit="10" />
          <path d="M9.66669 15.5H17.25" stroke="#141414" stroke-miterlimit="10" />
          <path d="M6.75 8.5H7.625" stroke="#141414" />
          <path d="M6.75 12H7.625" stroke="#141414" />
          <path d="M6.75 15.5H7.625" stroke="#141414" />
        </svg>
      }
    />
  );
}

export function Link({ onClick }: { onClick: () => void }) {
  return (
    <IconContainer
      icon={
        <svg
          onClick={onClick}
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect width="24" height="24" />
          <path
            d="M9.33335 8.6665H8.00002C7.11597 8.6665 6.26812 9.01769 5.643 9.64281C5.01788 10.2679 4.66669 11.1158 4.66669 11.9998C4.66669 12.8839 5.01788 13.7317 5.643 14.3569C6.26812 14.982 7.11597 15.3332 8.00002 15.3332H9.33335"
            stroke="#141414"
          />
          <path d="M8.66669 12H15.3334" stroke="#141414" />
          <path
            d="M14.6667 15.3332H16C16.8841 15.3332 17.7319 14.982 18.357 14.3569C18.9822 13.7317 19.3334 12.8839 19.3334 11.9998C19.3334 11.1158 18.9822 10.2679 18.357 9.64281C17.7319 9.01769 16.8841 8.6665 16 8.6665H14.6667"
            stroke="#141414"
          />
        </svg>
      }
    />
  );
}

function IconContainer({ icon }: { icon: React.ReactElement }) {
  return (
    <StyledIcon
      onMouseDown={(e) => {
        // This will prevent the textarea from losing focus when user clicks a markdown icon
        e.preventDefault();
      }}
    >
      {icon}
    </StyledIcon>
  );
}

const StyledIcon = styled.div`
  margin-right: 4px;
  cursor: pointer;

  & svg rect {
    transition: fill 300ms ease;
    fill: rgba(254, 254, 254, 1);
  }

  &:hover svg rect {
    fill: rgba(249, 249, 249, 1);
  }

  &:active svg rect {
    fill: rgba(226, 226, 226, 1);
  }
`;
