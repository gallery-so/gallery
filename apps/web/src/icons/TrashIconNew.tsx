export function TrashIconNew(_props: JSX.IntrinsicElements['svg']) {
  const { color = 'currentColor', ...props } = _props;
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="M2 4.66666H3.33333H14" stroke={color} />
      <path
        d="M12.3334 4.66668L11.6667 14H4.33341L3.66675 4.66668M5.33341 4.66668L5.66675 2.33334H10.3334L10.6667 4.66668"
        stroke={color}
      />
    </svg>
  );
}
