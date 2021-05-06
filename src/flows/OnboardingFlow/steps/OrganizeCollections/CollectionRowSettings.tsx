import styled from 'styled-components';
import { Collection } from 'types/Collection';

import Dropdown, {
  StyledDropdownButton,
} from 'components/core/Dropdown/Dropdown';
import ActionText from 'components/core/ActionText/ActionText';

type Props = {
  collection: Collection;
};

function CollectionRowSettings({ collection }: Props) {
  return (
    <StyledCollectionRowSettings>
      <Dropdown>
        <StyledDropdownItem>
          <ActionText>Edit collection</ActionText>
        </StyledDropdownItem>
        <StyledDropdownItem>
          <ActionText>{`Edit name & description`}</ActionText>
        </StyledDropdownItem>
        <StyledDropdownItem>
          <ActionText>{collection.isHidden ? 'Show' : 'Hide'}</ActionText>
        </StyledDropdownItem>
        <StyledDropdownItem>
          <ActionText>Delete</ActionText>
        </StyledDropdownItem>
      </Dropdown>
    </StyledCollectionRowSettings>
  );
}

const StyledDropdownItem = styled.div`
  margin: 8px;
`;

const StyledCollectionRowSettings = styled.div`
  position: absolute;
  right: 24px;
  top: 28px;
  z-index: 10;

  ${StyledDropdownButton} {
    width: 32px;
    height: 24px;
  }
`;

export default CollectionRowSettings;
