import { memo, useCallback, useRef } from 'react';
import { RouteComponentProps } from '@reach/router';
import styled from 'styled-components';
import useSwr from 'swr';
import { useModal } from 'contexts/modal/ModalContext';

function Home(_: RouteComponentProps) {
  // on dev, this will route to localhost:4000/api/test
  // on prod, this will route to api.gallery.so/api/test
  // const { data, error } = useSwr('/test');
  // console.log('the result', data, error);
  const { showModal } = useModal();

  const ModalContentRef = useRef(<div>connect your wallet</div>);

  const handleClick = useCallback(() => {
    showModal(ModalContentRef.current);
  }, []);

  return (
    <StyledHome>
      <StyledHeader>GALLERY</StyledHeader>
      <button onClick={handleClick}>Sign In</button>
    </StyledHome>
  );
}

const StyledHome = styled.div`
  text-align: center;
`;

const StyledHeader = styled.p`
  color: white;
  font-size: 30px;
`;

export default memo(Home);
