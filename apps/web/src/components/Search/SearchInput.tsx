import { useCallback, useEffect, useRef } from 'react';
import styled from 'styled-components';

import colors from '../core/colors';
import { useSearchContext } from './SearchContext';

export default function SearchInput() {
  const ref = useRef<HTMLInputElement>(null);
  const { setKeyword } = useSearchContext();

  useEffect(() => {
    if (ref.current) {
      ref.current.focus();
    }
  }, []);

  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setKeyword(event.target.value);
    },
    [setKeyword]
  );

  return (
    <StyledInput
      ref={ref}
      type="text"
      placeholder="Search for anything..."
      onChange={handleChange}
    />
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
