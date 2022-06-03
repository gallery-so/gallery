import { memo, useState } from 'react';
import styled from 'styled-components';
import { useRouter } from 'next/router';
import NftNycIntro from './NftNycIntro';
import NftNycDetails from './EventDetails/EventDetailsPage';

function NftNycEventPage() {
  const { push } = useRouter();

  const [showDetails, setShowDetails] = useState(false);

  return (
    <StyledNftNycEventPage>
      {showDetails ? <NftNycDetails /> : <NftNycIntro setShowDetails={setShowDetails} />}
    </StyledNftNycEventPage>
  );
}

const StyledNftNycEventPage = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;

  height: 100vh;
`;

export default memo(NftNycEventPage);
