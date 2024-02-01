export default function BookmarkIcon({ isActive }: { isActive: boolean }) {
  return (
    <svg
      width="25"
      height="24"
      viewBox="0 0 25 24"
      fill={isActive ? '#0022F0' : 'none'}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M19.3125 20L12.8125 14L6.3125 20V4H19.3125V20Z"
        stroke={isActive ? '#0022F0' : 'black'}
      />
    </svg>
  );
}
