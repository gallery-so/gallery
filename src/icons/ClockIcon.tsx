import colors from '~/components/core/colors';

type Props = {
  className?: string;
  color?: colors;
};

export default function ClockIcon({ className, color = colors.offBlack }: Props) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M8 4V8.33333L6 10.6667" stroke={color} />
      <path d="M1.43333 9.16C1.56748 9.92558 1.83607 10.6614 2.22667 11.3333" stroke={color} />
      <path d="M2.22667 4.66667C1.83607 5.33863 1.56748 6.07442 1.43333 6.84" stroke={color} />
      <path d="M5.72 1.73333C4.99086 2.00056 4.31402 2.39313 3.72 2.89333" stroke={color} />
      <path
        d="M3.71333 13.1067C4.53427 13.7956 5.50919 14.2765 6.55548 14.5085C7.60177 14.7406 8.68859 14.7169 9.72381 14.4397C10.759 14.1624 11.7121 13.6396 12.5024 12.9156C13.2926 12.1917 13.8966 11.2879 14.2633 10.2808C14.63 9.27381 14.7484 8.19322 14.6087 7.13065C14.4689 6.06809 14.0751 5.05488 13.4605 4.1769C12.8459 3.29892 12.0287 2.58205 11.0781 2.08705C10.1276 1.59205 9.07171 1.3335 8 1.33333"
        stroke={color}
      />
    </svg>
  );
}
