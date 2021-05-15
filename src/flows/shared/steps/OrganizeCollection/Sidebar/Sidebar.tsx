import { memo } from 'react';
import styled from 'styled-components';

import { BodyMedium, BodyRegular } from 'components/core/Text/Text';
import colors from 'components/core/colors';
import Spacer from 'components/core/Spacer/Spacer';
import { FOOTER_HEIGHT } from 'flows/OnboardingFlow/WizardFooter';
import SidebarNftIcon from './SidebarNftIcon';

import { EditModeNft } from 'types/Nft';

import { useAllNftsState } from 'contexts/collectionEditor/CollectionEditorContext';

function Sidebar() {
  const allNfts = useAllNftsState();
  return (
    <StyledSidebar>
      <Header>
        <BodyMedium>Your NFTs</BodyMedium>
        <BodyRegular color={colors.gray50}>0xj2T2...a81H</BodyRegular>
      </Header>
      <Spacer height={12} />
      <Selection>
        {allNfts.map((editModeNft: EditModeNft, index: number) => (
          <SidebarNftIcon
            key={editModeNft.nft.id}
            editModeNft={editModeNft}
            index={index}
          />
        ))}
      </Selection>
      <Spacer height={12} />
    </StyledSidebar>
  );
}

const StyledSidebar = styled.div`
  width: 100%;
  height: calc(100vh - ${FOOTER_HEIGHT}px);

  background: #f7f7f7;

  padding: 50px 32px;

  overflow: scroll;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
`;

const Selection = styled.div`
  display: flex;
  flex-wrap: wrap;
  column-gap: 12px;
  row-gap: 12px;
`;

export default memo(Sidebar);
