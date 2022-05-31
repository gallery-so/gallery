export default function FollowingIcon({ className }: { className?: string }) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M8.5 11C10.7091 11 12.5 9.20914 12.5 7C12.5 4.79086 10.7091 3 8.5 3C6.29086 3 4.5 4.79086 4.5 7C4.5 9.20914 6.29086 11 8.5 11Z"
        stroke="#0022F0"
      />
      <path d="M1 20.5V16.5L4 13.5L8.5 15L13 13.5L16 16.5V20.5" stroke="#0022F0" />
      <path d="M16 9.5L18.5 12L23 7.5" stroke="#0022F0" strokeMiterlimit="10" />
    </svg>
  );
}
