import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import { ProfilePictureDropdownFragment$key } from '~/generated/ProfilePictureDropdownFragment.graphql';
import { AllGalleriesIcon } from '~/icons/AllGalleriesIcon';
import { TrashIconNew } from '~/icons/TrashIconNew';
import colors from '~/shared/theme/colors';

import { Dropdown } from '../core/Dropdown/Dropdown';
import { DropdownItem } from '../core/Dropdown/DropdownItem';
import { DropdownSection } from '../core/Dropdown/DropdownSection';
import { HStack } from '../core/Spacer/Stack';
import { BaseS } from '../core/Text/Text';
import useNftSelector from '../NftSelector/useNftSelector';

type Props = {
  open: boolean;
  onClose: () => void;
  tokensRef: ProfilePictureDropdownFragment$key;
};

export function ProfilePictureDropdown({ open, onClose, tokensRef }: Props) {
  const tokens = useFragment(
    graphql`
      fragment ProfilePictureDropdownFragment on Token @relay(plural: true) {
        ...useNftSelectorQueryFragment
      }
    `,
    tokensRef
  );

  const showNftSelector = useNftSelector(tokens);

  return (
    <Dropdown position="left" active={open} onClose={onClose}>
      <DropdownSection>
        <StyledDropdownItem onClick={() => {}}>
          <StyledDropdownItemContainer gap={8}>
            <StyledEnsAvatar />
            <BaseS>Use ENS Avatar</BaseS>
          </StyledDropdownItemContainer>
        </StyledDropdownItem>
        <StyledDropdownItem onClick={showNftSelector}>
          <StyledDropdownItemContainer gap={8}>
            <AllGalleriesIcon />
            <BaseS>Choose an NFT</BaseS>
          </StyledDropdownItemContainer>
        </StyledDropdownItem>
        <StyledDropdownItem onClick={() => {}}>
          <StyledDropdownItemContainer gap={8}>
            <TrashIconNew color="#E12E16" />
            <StyledRemoveText>Remove current profile picture</StyledRemoveText>
          </StyledDropdownItemContainer>
        </StyledDropdownItem>
      </DropdownSection>
    </Dropdown>
  );
}

const StyledEnsAvatar = styled.div`
  height: 16px;
  width: 16px;
  border-radius: 50%;
  background-color: ${colors.metal};
`;

const StyledDropdownItemContainer = styled(HStack)``;

const StyledRemoveText = styled(BaseS)`
  color: #e12e16;
`;

const StyledDropdownItem = styled(DropdownItem)`
  ${BaseS} {
    color: ${colors.shadow};
    font-weight: 500;
  }

  ${StyledRemoveText} {
    color: #e12e16;
  }
  &:hover {
    color: ${colors.black[800]};

    ${BaseS} {
      color: ${colors.black[800]};
    }

    ${StyledRemoveText} {
      color: #e12e16;
    }
  }
`;
