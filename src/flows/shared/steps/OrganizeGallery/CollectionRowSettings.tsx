import styled from 'styled-components';
import { Collection } from 'types/Collection';

import Dropdown, {
  StyledDropdownButton,
} from 'components/core/Dropdown/Dropdown';
import ActionText from 'components/core/ActionText/ActionText';
import { useCallback } from 'react';
import TextButton from 'components/core/Button/TextButton';

type Props = {
  collection: Collection;
};

function CollectionRowSettings({ collection }: Props) {
  const handleToggleHiddenClick = useCallback(() => {
    // update collection state
  }, []);

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
          <TextButton
            onClick={handleToggleHiddenClick}
            text={collection.isHidden ? 'Show' : 'Hide'}
          ></TextButton>
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
