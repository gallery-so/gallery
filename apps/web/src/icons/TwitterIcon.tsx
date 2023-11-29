type Props = {
  size?: 'sm' | 'md';
  fillColor?: string;
};

export default function TwitterIcon({ size = 'sm', fillColor = '#000' }: Props) {
  if (size === 'md') {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="18" fill="none">
        <path
          fill={fillColor}
          d="M21.459 2.5a8.763 8.763 0 0 1-2.471.678A4.337 4.337 0 0 0 20.88.794a8.907 8.907 0 0 1-2.736 1.036A4.3 4.3 0 0 0 10.7 4.768c0 .331.038.66.111.983a12.194 12.194 0 0 1-8.876-4.485 4.226 4.226 0 0 0-.582 2.166 4.307 4.307 0 0 0 1.914 3.584 4.292 4.292 0 0 1-1.949-.539v.053a4.306 4.306 0 0 0 3.452 4.223 4.342 4.342 0 0 1-1.935.075 4.318 4.318 0 0 0 4.028 2.99 8.629 8.629 0 0 1-5.339 1.841c-.342 0-.684-.02-1.024-.059a12.253 12.253 0 0 0 6.613 1.932A12.16 12.16 0 0 0 19.361 5.3c0-.183 0-.367-.013-.55A8.69 8.69 0 0 0 21.5 2.515l-.041-.016Z"
        />
      </svg>
    );
  }
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="12" fill="none">
      <path
        fill={fillColor}
        d="M13.973 1.667c-.524.23-1.08.383-1.648.452a2.891 2.891 0 0 0 1.262-1.59 5.938 5.938 0 0 1-1.824.691 2.867 2.867 0 0 0-4.889 2.614A8.13 8.13 0 0 1 .957.844a2.817 2.817 0 0 0-.388 1.444 2.871 2.871 0 0 0 1.276 2.39 2.861 2.861 0 0 1-1.3-.36v.035A2.87 2.87 0 0 0 2.847 7.17c-.421.113-.862.13-1.29.05A2.879 2.879 0 0 0 4.242 9.21 5.752 5.752 0 0 1 0 10.4a8.17 8.17 0 0 0 4.409 1.288 8.105 8.105 0 0 0 8.165-8.155c0-.122 0-.244-.009-.367A5.794 5.794 0 0 0 14 1.677l-.027-.01Z"
      />
    </svg>
  );
}
