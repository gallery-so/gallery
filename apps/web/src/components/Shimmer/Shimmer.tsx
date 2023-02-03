import styled, { keyframes } from 'styled-components';

const loading = keyframes`
  from {
    background-position: 200% 0;
  }
  to {
    background-position: -200% 0;
  }
`;

const Shimmer = styled.div<{ colorful?: boolean }>`
  display: block;
  width: 100%;

  aspect-ratio: 1;
  /* hack for safari, since it doesn't support aspect-ratio yet */
  padding-top: 100%;

  background-image: ${({ colorful }) =>
    colorful
      ? `linear-gradient(
           270deg,
           #c1e1ff,
           #fbc7f0,
           #d6fbc7,
           #c1e1ff
         )`
      : `linear-gradient(
           270deg,
           #fafafa,
           #eaeaea,
           #eaeaea,
           #fafafa
         )`};
  background-size: 400% 100%;
  animation: ${loading} 6s cubic-bezier(0, 0.38, 0.58, 1) infinite;
`;

export default Shimmer;
