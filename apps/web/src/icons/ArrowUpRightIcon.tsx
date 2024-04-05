export default function ArrowUpRightIcon({ color }: { color?: string }) {
  const stroke = color || '#FEFEFE';
  return (
    <svg width="17" height="16" viewBox="0 0 17 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M6.5 3.33331H13.1667V9.99998" stroke={stroke} strokeMiterlimit="10" />
      <path d="M13.1667 3.33331L4.5 12" stroke={stroke} strokeMiterlimit="10" />
    </svg>
  );
}
