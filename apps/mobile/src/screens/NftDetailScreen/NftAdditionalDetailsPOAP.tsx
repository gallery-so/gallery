import { format, parse } from 'date-fns';
import { View } from 'react-native';
import { graphql, useFragment } from 'react-relay';

import { NftAdditionalDetailsPOAPFragment$key } from '~/generated/NftAdditionalDetailsPOAPFragment.graphql';
import {
  DetailLabelText,
  DetailSection,
  DetailValue,
} from '~/screens/NftDetailScreen/DetailSection';

type POAPNftDetailSectionProps = {
  showDetails: boolean;
  tokenRef: NftAdditionalDetailsPOAPFragment$key;
};

export function NftAdditionalDetailsPOAP({ tokenRef, showDetails }: POAPNftDetailSectionProps) {
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
    <View className="flex flex-col space-y-4">
      {formattedDate && (
        <DetailSection>
          <DetailLabelText>Created</DetailLabelText>
          <DetailValue>{formattedDate}</DetailValue>
        </DetailSection>
      )}
      {location && (
        <DetailSection>
          <DetailLabelText>Location</DetailLabelText>
          <DetailValue>{location}</DetailValue>
        </DetailSection>
      )}

      {showDetails && (
        <View className="flex flex-col space-y-4">
          {id && (
            <DetailSection>
              <DetailLabelText>POAP ID</DetailLabelText>
              <DetailValue>{id}</DetailValue>
            </DetailSection>
          )}
          {supply && (
            <DetailSection>
              <DetailLabelText>SUPPLY</DetailLabelText>
              <DetailValue>{supply}</DetailValue>
            </DetailSection>
          )}
          {chain && (
            <DetailSection>
              <DetailLabelText>CHAIN</DetailLabelText>
              <DetailValue>{chain}</DetailValue>
            </DetailSection>
          )}
        </View>
      )}
    </View>
  );
}
