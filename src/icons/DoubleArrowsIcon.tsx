export default function DoubleArrowsIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g clipPath="url(#clip0_422_8644)">
        <path
          d="M4.66669 12.0001L8.00002 15.3335L11.3334 12.0001"
          stroke="black"
          strokeMiterlimit="10"
        />
        <path
          d="M11.3334 4.00012L8.00002 0.666789L4.66669 4.00012"
          stroke="black"
          strokeMiterlimit="10"
        />
      </g>
      <defs>
        <clipPath id="clip0_422_8644">
          <rect width="16" height="16" fill="white" transform="translate(0 16.0001) rotate(-90)" />
        </clipPath>
      </defs>
    </svg>
  );
}
