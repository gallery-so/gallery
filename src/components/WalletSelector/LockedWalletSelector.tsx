import colors from 'components/core/colors';
import { useCallback, useState } from 'react';
import styled from 'styled-components';
import WalletSelector from './WalletSelector';
import { Text } from 'components/core/Text/Text';

const HASH = -1695594350;

// basic hash function used to validate user entered password
// it is ok if users figure out the pw -
// this validation is clientside only and exists to manage
// the # of new account creations while we grow

function generateHash(string: string) {
  var hash = 0;
  if (string.length === 0) return hash;
  for (let i = 0; i < string.length; i++) {
    var charCode = string.charCodeAt(i);
    hash = (hash << 7) - hash + charCode;
    hash = hash & hash;
  }
  return hash;
}

function LockedWalletSelector() {
  const [isUnlocked, setIsUnlocked] = useState(false);

  const unlock = useCallback(() => {
    setIsUnlocked(true);
  }, []);

  const handleSubmit = useCallback(
    (event) => {
      event.preventDefault();
      const userValue = event.target.elements.password.value;
      const pwHash = generateHash(userValue);
      if (pwHash === HASH) {
        unlock();
      }
    },
    [unlock]
  );

  if (isUnlocked) {
    return <WalletSelector />;
  }

  return (
    <StyledForm onSubmit={handleSubmit}>
      <StyledText>
        For the alpha, creating a gallery is currently an invite only feature.
      </StyledText>
      <StyledText>
        If you have a password, enter it below to continue with sign on.
      </StyledText>
      <StyledWaitlistLink
        href="https://0michaelwen.typeform.com/to/JKzV8Zcx"
        target="_blank"
      >
        <StyledLinkText>
          Want your own? Sign up for the waitlist.
        </StyledLinkText>
      </StyledWaitlistLink>
      <StyledPasswordInput
        name="password"
        type="password"
        placeholder="Enter password"
      />
    </StyledForm>
  );
}

const StyledText = styled(Text)`
  margin-bottom: 10px;
`;

const StyledLinkText = styled(Text)`
  color: ${colors.gray};
  transition: color 0.2s;
`;

const StyledWaitlistLink = styled.a`
  margin-top: 30px;
  color: ${colors.gray};
  &:hover ${StyledLinkText} {
    color: ${colors.black};
  }
`;

const StyledForm = styled.form`
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const StyledPasswordInput = styled.input`
  margin-top: 20px;
  border: 1px solid ${colors.faintGray};
  line-height: 1.25rem;
  padding: 0.5rem 2.5rem 0.5rem 1rem;
  transition: outline 0.5s;
  outline-color: ${colors.black} !important;

  &active: {
    border-width: 2px;
  }
`;

export default LockedWalletSelector;
