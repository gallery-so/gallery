import { useEffect, useRef } from 'react';
import styled from 'styled-components';

import colors from '../core/colors';

type Props = {
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
};

export default function SearchInput({ onChange }: Props) {
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.focus();
    }
  }, []);

  return (
    <StyledInput ref={ref} type="text" placeholder="Search for anything..." onChange={onChange} />
  );
}

const StyledInput = styled.input`
  width: 100%;

  border: none;
  padding: 0;

  font-size: 24px;
  background-color: transparent;
  color: ${colors.offBlack};
  caret-color: ${colors.offBlack};

  &::placeholder {
    color: ${colors.porcelain};
  }
`;
