import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import { NftSelectorViewFragment$key } from '~/generated/NftSelectorViewFragment.graphql';

import { groupCollectionsByAddress } from '../GalleryEditor/PiecesSidebar/groupCollectionsByAddress';
import { NftSelectorTokenPreview } from './NftSelectorTokenPreview';

type Props = {
  tokenRefs: NftSelectorViewFragment$key;
};

export function NftSelectorView({ tokenRefs }: Props) {
  const tokens = useFragment(
    graphql`
      fragment NftSelectorViewFragment on Token @relay(plural: true) {
        id
        dbid

        # Escape hatch for data processing in util files
        # eslint-disable-next-line relay/unused-fields
        chain
        # Escape hatch for data processing in util files
        # eslint-disable-next-line relay/unused-fields
        isSpamByUser
        # Escape hatch for data processing in util files
        # eslint-disable-next-line relay/unused-fields
        isSpamByProvider

        contract {
          # Escape hatch for data processing in util files
          # eslint-disable-next-line relay/unused-fields
          name

          contractAddress {
            address
          }
        }

        ...NftSelectorTokenFragment
      }
    `,
    tokenRefs
  );

  const groupedTokens = groupCollectionsByAddress({
    // @ts-expect-error: fix this
    tokens,
    ignoreSpam: true,
  });

  console.log(groupedTokens);

  return (
    <StyledNftSelectorViewContainer>
      {groupedTokens.map((group) => {
        return <NftSelectorTokenPreview key={group.title} group={group} />;
      })}
    </StyledNftSelectorViewContainer>
  );
}

const StyledNftSelectorViewContainer = styled.div`
  padding: 16px 0;

  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));

  gap: 16px;
`;
