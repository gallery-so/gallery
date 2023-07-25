import { format, parse } from 'date-fns';
import { graphql, useFragment } from 'react-relay';

import { VStack } from '~/components/core/Spacer/Stack';
import { BaseM, TitleXS } from '~/components/core/Text/Text';
import { NftAdditionalDetailsPOAPFragment$key } from '~/generated/NftAdditionalDetailsPOAPFragment.graphql';

type POAPNftDetailSectionProps = {
  tokenRef: NftAdditionalDetailsPOAPFragment$key;
};

export function NftAdditionalDetailsPOAP({ tokenRef }: POAPNftDetailSectionProps) {
  const token = useFragment(
    graphql`
      fragment NftAdditionalDetailsPOAPFragment on Token {
        tokenMetadata
      }
    `,
    tokenRef
  );

  if (!token.tokenMetadata) {
    return null;
  }

  const {
    city,
    country,
    created,
    event_id: id,
    supply,
    chain,
  } = JSON.parse(token.tokenMetadata) ?? {};

  const location = city && country ? `${city}, ${country}` : null;

  const parsedDate = created ? parse(created, 'yyyy-MM-dd HH:mm:ss', new Date()) : null;
  const formattedDate = parsedDate ? format(parsedDate, 'MMMM do, yyyy') : null;

  return (
    <VStack gap={16}>
      {formattedDate && (
        <div>
          <TitleXS>Created</TitleXS>
          <BaseM>{formattedDate}</BaseM>
        </div>
      )}
      {location && (
        <div>
          <TitleXS>Location</TitleXS>
          <BaseM>{location}</BaseM>
        </div>
      )}

      {id && (
        <div>
          <TitleXS>POAP ID</TitleXS>
          <BaseM>{id}</BaseM>
        </div>
      )}
      {supply && (
        <div>
          <TitleXS>SUPPLY</TitleXS>
          <BaseM>{supply}</BaseM>
        </div>
      )}
      {chain && (
        <div>
          <TitleXS>CHAIN</TitleXS>
          <BaseM>{chain}</BaseM>
        </div>
      )}
    </VStack>
  );
}
