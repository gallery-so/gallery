import colors from 'shared/theme/colors';

type Props = {
  color?: string;
};

export default function SearchIcon({ color = colors.black['800'] }: Props) {
  return (
    <svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M7 13.5C10.5899 13.5 13.5 10.5899 13.5 7C13.5 3.41015 10.5899 0.5 7 0.5C3.41015 0.5 0.5 3.41015 0.5 7C0.5 10.5899 3.41015 13.5 7 13.5Z"
        stroke={color}
      />
      <path d="M16.4 16.5L11.5 11.7" stroke={color} />
    </svg>
  );
}
