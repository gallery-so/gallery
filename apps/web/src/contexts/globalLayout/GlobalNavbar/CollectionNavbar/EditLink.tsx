export function EditLink(props: JSX.IntrinsicElements['svg']) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M3 21L4 16.5L17.5 3H18.5L21 5.5V6.5L7.5 20L3 21Z"
        stroke="black"
        strokeMiterlimit="10"
      />
      <path d="M15.5 4.5L19.5 8.5" stroke="black" strokeMiterlimit="10" />
    </svg>
  );
}
