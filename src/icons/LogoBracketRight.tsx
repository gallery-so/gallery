import colors from 'components/core/colors';

type Props = {
  className?: string;
  color?: colors;
};

export default function LogoBracketRight({ className, color = colors.offBlack }: Props) {
  return (
    <svg
      className={className}
      width="5"
      height="16"
      viewBox="0 0 5 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M0.391486 0.19397C6.24582 3.64674 6.24307 12.3544 0.391486 15.8061L0.100586 15.3488C1.29419 14.5225 2.2709 13.4205 2.94787 12.1362C5.04917 8.18928 3.79632 3.17073 0.100586 0.650705L0.391486 0.19397Z"
        fill={color}
      />
    </svg>
  );
}
