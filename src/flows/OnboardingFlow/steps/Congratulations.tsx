import { useCallback } from 'react';
import styled from 'styled-components';
import { BodyRegular, TitleL } from 'components/core/Text/Text';
import Button from 'components/core/Button/Button';
import colors from 'components/core/colors';
import Spacer from 'components/core/Spacer/Spacer';
import FullPageCenteredStep from 'flows/shared/components/FullPageCenteredStep/FullPageCenteredStep';
import { useAuthenticatedUsername } from 'hooks/api/users/useUser';
import { useRouter } from 'next/router';

function Congratulations() {
  const username = useAuthenticatedUsername();
  const { push } = useRouter();

  const handleClick = useCallback(() => {
    void push(`/${username}`);
  }, [username, push]);

  return (
    <FullPageCenteredStep>
      <TitleL>Welcome to your Gallery</TitleL>
      <Spacer height={8} />
      <StyledBodyText color={colors.gray50}>
        Let&apos;s show your collection to the world.
      </StyledBodyText>
      <Spacer height={24} />
      <StyledButton text="Enter" onClick={handleClick} />
    </FullPageCenteredStep>
  );
}

const StyledBodyText = styled(BodyRegular)`
  max-width: 400px;
  text-align: center;
`;

const StyledButton = styled(Button)`
  padding: 0px 24px;
  width: 200px;
`;

export default Congratulations;
