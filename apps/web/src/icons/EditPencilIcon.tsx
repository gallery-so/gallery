type Props = {
  width?: number | string;
  height?: number | string;
} & JSX.IntrinsicElements['svg'];

export function EditPencilIcon({ height = 14, width = 14, ...props }: Props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 14 14"
      width={width}
      height={height}
      fill="none"
      {...props}
    >
      <path
        stroke="currentColor"
        strokeMiterlimit="10"
        d="m1 13 .667-3 9-9h.666L13 2.667v.666l-9 9L1 13ZM9.334 2 12 4.667"
      />
    </svg>
  );
}
