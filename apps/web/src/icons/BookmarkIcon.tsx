import colors from 'shared/theme/colors';

const COLOR_SCHEME = {
  white: {
    activeFillColor: colors.white,
    activeStrokeColor: colors.white,
    inactiveFillColor: 'none',
    inactiveStrokeColor: colors.white,
  },
  blue: {
    activeFillColor: colors.activeBlue,
    activeStrokeColor: colors.activeBlue,
    inactiveFillColor: 'none',
    inactiveStrokeColor: colors.black['800'],
  },
  black: {
    activeFillColor: colors.black['800'],
    activeStrokeColor: colors.black['800'],
    inactiveFillColor: 'none',
    inactiveStrokeColor: colors.black['800'],
  },
};

export default function BookmarkIcon({
  isActive,
  colorScheme,
  width,
}: {
  isActive: boolean;
  colorScheme: 'white' | 'blue' | 'black';
  width?: number;
}) {
  return (
    <svg
      width={width ?? '25'}
      height={width ? width + 1 : '24'}
      viewBox="-0.5 0 27 24"
      fill={
        isActive
          ? COLOR_SCHEME[colorScheme].activeFillColor
          : COLOR_SCHEME[colorScheme].inactiveFillColor
      }
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M19.3125 20L12.8125 14L6.3125 20V4H19.3125V20Z"
        stroke={
          isActive
            ? COLOR_SCHEME[colorScheme].activeStrokeColor
            : COLOR_SCHEME[colorScheme].inactiveStrokeColor
        }
      />
    </svg>
  );
}
