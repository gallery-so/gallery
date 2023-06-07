import { useCallback, useEffect, useRef, useState } from 'react';
import styled from 'styled-components';

import colors from '~/shared/theme/colors';

import { useSearchContext } from './SearchContext';

export default function SearchInput() {
  const ref = useRef<HTMLInputElement>(null);
  const { keyword, setKeyword } = useSearchContext();

  const [localKeyword, setLocalKeyword] = useState<string>(keyword);

  useEffect(() => {
    if (ref.current) {
      ref.current.focus();
    }
  }, []);

  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setKeyword(event.target.value);
      setLocalKeyword(event.target.value);
    },
    [setKeyword]
  );

  return (
    <StyledInput
      ref={ref}
      type="text"
      autoComplete="off"
      autoCorrect="off"
      placeholder="Search for anything..."
      onChange={handleChange}
      value={localKeyword}
    />
  );
}

const StyledInput = styled.input`
  width: 100%;

  border: none;
  padding: 0;

  font-size: 24px;
  background-color: transparent;
  color: ${colors.black['800']};
  caret-color: ${colors.black['800']};

  &::placeholder {
    color: ${colors.porcelain};
  }
`;
