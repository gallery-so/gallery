import styled from 'styled-components';

import colors from '~/shared/theme/colors';

import { HStack, VStack } from './core/Spacer/Stack';
import { TitleXS } from './core/Text/Text';
import { RawProfilePicture } from './RawProfilePicture';

const avatarUrl =
  'https://s3-alpha-sig.figma.com/img/9a4f/b777/fe4c335512ca4297ad4fd60554e66f18?Expires=1687132800&Signature=I3Q4ovLmvhWUw7EIsyaXhgv6T7hQiKdJHGNL~6c37Y7WLA0pAReuVxFyedUP3RDKemx~IqEg4fNSnqMJl0Y1h7UeQDGIN8Pk9tPn84DW0rHM5DA7himn6yBbbJE0EkEERnmMA4SjQBDoM4axl4-nFVkq~6jNXwjP2ikp7-4ECO-ZOqS0IB8Z-w2ej1bkh2OU6dLZCw4rap2O6zo0egtH6nhHVXMZQnxfHbg2yZzvk3mJflP4vh5g8bFV478Ixxh7gLK-JZV5HvxjKUusvmcWomQpMNE-WasMjp4DapBQijhAyBjl7h03L09Rc0Z2uLRZwt0OoliaIBdzTh8m17NNtw__&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4';

export function ProfilePictureStack() {
  return (
    <StyledProfilePictureStackContainer align="center">
      <StyledRawProfilePictureContainer>
        <RawProfilePicture imageUrl={avatarUrl} hasInset size="sm" />
      </StyledRawProfilePictureContainer>
      <StyledRawProfilePictureContainer>
        <RawProfilePicture imageUrl={avatarUrl} hasInset size="sm" />
      </StyledRawProfilePictureContainer>
      <StyledRawProfilePictureContainer>
        <RawProfilePicture imageUrl={avatarUrl} hasInset size="sm" />
      </StyledRawProfilePictureContainer>
      <StyledRemainings align="center" justify="center" shrink>
        <StyledRemainingsText color={colors.metal}>+ 6</StyledRemainingsText>
      </StyledRemainings>
    </StyledProfilePictureStackContainer>
  );
}

const StyledRawProfilePictureContainer = styled.div`
  margin-left: -8px;
  position: relative;
  z-index: 1;
`;

const StyledProfilePictureStackContainer = styled(HStack)`
  ${StyledRawProfilePictureContainer}:nth-child(1) {
    margin-left: 0;
  }
`;

const StyledRemainings = styled(VStack)`
  background-color: ${colors.porcelain};
  padding: 2px 8px;
  height: fit-content;

  border: 2px solid ${colors.white};
  border-radius: 24px;

  margin-left: -8px;
  z-index: 1;
`;

const StyledRemainingsText = styled(TitleXS)`
  font-weight: 500;
`;
