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
    <View className="flex flex-col space-y-4">
      <>
        {location && (
          <View className="flex flex-row">
            <DetailSection>
              <DetailLabelText>LOCATION</DetailLabelText>
              <DetailValue>{location}</DetailValue>
            </DetailSection>
          </View>
        )}
        <View className="flex flex-row space-x-16">
          {formattedDate && (
            <DetailSection>
              <DetailLabelText>CREATED</DetailLabelText>
              <DetailValue>{formattedDate}</DetailValue>
            </DetailSection>
          )}

          {id && (
            <DetailSection>
              <DetailLabelText>POAP ID</DetailLabelText>
              <DetailValue>{id}</DetailValue>
            </DetailSection>
          )}
        </View>

        <View className="flex flex-row space-x-7">
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
      </>
    </View>
  );
}
