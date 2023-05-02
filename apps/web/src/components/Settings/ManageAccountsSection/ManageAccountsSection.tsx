import { graphql, useFragment } from 'react-relay';

import { VStack } from '~/components/core/Spacer/Stack';
import { TitleDiatypeL } from '~/components/core/Text/Text';
import ManageWallets from '~/components/ManageWallets/ManageWallets';
import { ManageAccountsSectionFragment$key } from '~/generated/ManageAccountsSectionFragment.graphql';

type Props = {
  queryRef: ManageAccountsSectionFragment$key;
};

export default function ManageAccountsSection({ queryRef }: Props) {
  const query = useFragment(
    graphql`
      fragment ManageAccountsSectionFragment on Query {
        ...ManageWalletsFragment
      }
    `,
    queryRef
  );

  return (
    <VStack>
      <TitleDiatypeL>Manage Accounts</TitleDiatypeL>
      <ManageWallets queryRef={query} />
    </VStack>
  );
}
