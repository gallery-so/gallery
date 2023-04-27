import colors from '~/shared/theme/colors';

type Props = {
  className?: string;
  active: boolean;
};

export default function SnowflakeIcon({ className, active }: Props) {
  const color = active ? colors.offBlack : colors.metal;
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className={className}>
      <line x1="12" y1="0.98" x2="12" y2="23.02" fill="none" stroke={color} strokeMiterlimit="10" />
      <line
        x1="9.01"
        y1="21.01"
        x2="12.01"
        y2="17.99"
        fill="none"
        stroke={color}
        strokeMiterlimit="10"
      />
      <line
        x1="15.01"
        y1="21.01"
        x2="12.01"
        y2="17.99"
        fill="none"
        stroke={color}
        strokeMiterlimit="10"
      />
      <line
        x1="15.01"
        y1="2.99"
        x2="12.01"
        y2="6.01"
        fill="none"
        stroke={color}
        strokeMiterlimit="10"
      />
      <line
        x1="9.01"
        y1="2.99"
        x2="12.01"
        y2="6.01"
        fill="none"
        stroke={color}
        strokeMiterlimit="10"
      />
      <line
        x1="21.64"
        y1="6.64"
        x2="2.37"
        y2="17.34"
        fill="none"
        stroke={color}
        strokeMiterlimit="10"
      />
      <line
        x1="2.68"
        y1="13.75"
        x2="6.77"
        y2="14.91"
        fill="none"
        stroke={color}
        strokeMiterlimit="10"
      />
      <line
        x1="5.59"
        y1="19"
        x2="6.77"
        y2="14.91"
        fill="none"
        stroke={color}
        strokeMiterlimit="10"
      />
      <line
        x1="21.34"
        y1="10.25"
        x2="17.25"
        y2="9.09"
        fill="none"
        stroke={color}
        strokeMiterlimit="10"
      />
      <line
        x1="18.43"
        y1="5"
        x2="17.25"
        y2="9.09"
        fill="none"
        stroke={color}
        strokeMiterlimit="10"
      />
      <line
        x1="21.64"
        y1="17.36"
        x2="2.39"
        y2="6.63"
        fill="none"
        stroke={color}
        strokeMiterlimit="10"
      />
      <line x1="5.6" y1="5" x2="6.78" y2="9.09" fill="none" stroke={color} />
      <line
        x1="2.68"
        y1="10.24"
        x2="6.78"
        y2="9.09"
        fill="none"
        stroke={color}
        strokeMiterlimit="10"
      />
      <line
        x1="18.42"
        y1="19.01"
        x2="17.24"
        y2="14.92"
        fill="none"
        stroke={color}
        strokeMiterlimit="10"
      />
      <line
        x1="21.34"
        y1="13.77"
        x2="17.24"
        y2="14.92"
        fill="none"
        stroke={color}
        strokeMiterlimit="10"
      />
    </svg>
  );
}
