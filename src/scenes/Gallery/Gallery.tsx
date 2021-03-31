import { RouteComponentProps } from '@reach/router';
import styled from 'styled-components';
// import useSwr from 'swr';

type Params = {
  usernameOrWalletAddress: string;
};

function Gallery({ usernameOrWalletAddress }: RouteComponentProps<Params>) {
  // TODO: support wallet addresses

  // TODO
  // if (usernameOrWalletAddress doesn't exist in our DB) {
  //     navigate('/404')
  // }

  // on dev, this will route to localhost:4000/api/test
  // on prod, this will route to api.gallery.so/api/test
  // const { data, error } = useSwr('/test');
  // console.log('the result', data, error);
  console.log({ usernameOrWalletAddress });
  return <StyledGallery>gallery of {usernameOrWalletAddress}</StyledGallery>;
}

const StyledGallery = styled.div``;

export default Gallery;
