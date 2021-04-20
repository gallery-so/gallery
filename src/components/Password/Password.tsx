import { useCallback, useState } from 'react';
import { navigate } from '@reach/router';
import PrimaryButton from 'components/core/Button/PrimaryButton';
import colors from 'components/core/colors';
import styled, { keyframes } from 'styled-components';

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

function Password() {
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

  const handleClick = useCallback(() => navigate('/connect'), []);

  return (
    <StyledPasswordContainer>
      <StyledForm onSubmit={handleSubmit}>
        <StyledPasswordInput
          disabled={isUnlocked}
          name="password"
          placeholder="Enter password"
        />
      </StyledForm>
      {isUnlocked && <StyledPrimaryButton text="Enter" onClick={handleClick} />}
    </StyledPasswordContainer>
  );
}

const StyledPasswordContainer = styled.div``;

const StyledForm = styled.form`
  display: flex;
  flex-direction: column;
  align-items: center;

  margin-top: 20px;
`;

const StyledPasswordInput = styled.input`
  margin: 20px 0 10px;
  padding: 0.5rem 2.5rem 0.5rem 1rem;
  border: 1px solid ${colors.faintGray};

  line-height: 1.25rem;
  outline-color: ${colors.black} !important;
  -webkit-text-security: disc;

  transition: outline 0.5s, background-color 0.5s;
  z-index: 10;

  &active: {
    border-width: 2px;
  }
  :disabled {
    background-color: ${colors.faintGray};
  }
`;

const TRANSLATE_PIXELS = -50;
const MODAL_TRANSITION_MS = 1500;

// ease-out like style
const transitionStyle = `${MODAL_TRANSITION_MS}ms cubic-bezier(0, 0, 0, 1.01)`;

const translateDown = keyframes`
  from { transform: translateY(${TRANSLATE_PIXELS}px) };
  to { transform: translateY(0px) };
`;

const fadeIn = keyframes`
  from {opacity: 0};
  to {opactity:100};
`;

const StyledPrimaryButton = styled(PrimaryButton)`
  width: 100%;
  animation: ${translateDown} ${transitionStyle}, ${fadeIn} ${transitionStyle};
`;

export default Password;
