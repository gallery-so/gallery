import { useFragment } from "react-relay";
import { graphql } from "relay-runtime";
import { CollectionFragment$key } from "~/generated/CollectionFragment.graphql";
import { FlatList, ListRenderItem, Text, View } from "react-native";
import { useCallback } from "react";
import { NftPreview } from "./NftPreview/NftPreview";

type CollectionProps = {
  collectionRef: CollectionFragment$key;
};

export function Collection({ collectionRef }: CollectionProps) {
  const collection = useFragment(
    graphql`
      fragment CollectionFragment on Collection {
        __typename
        dbid
        name
        collectorsNote
        tokens {
          token {
            dbid
            ...NftPreviewFragment
          }
        }
      }
    `,
    collectionRef
  );

  const tokens = collection.tokens?.map((token) => token?.token) ?? [];

  const renderItem = useCallback<ListRenderItem<(typeof tokens)[number]>>(
    (info) => {
      if (!info.item) {
        return null;
      }

      return (
        <View style={{ marginRight: 2 }}>
          <NftPreview tokenRef={info.item} />
        </View>
      );
    },
    []
  );

  return (
    <View style={{ display: "flex", flexDirection: "column" }}>
      <FlatList
        showsHorizontalScrollIndicator={false}
        windowSize={3}
        horizontal
        data={tokens}
        renderItem={renderItem}
      />
      <Text style={{ fontWeight: "bold", marginTop: 8 }}>
        A collection name
      </Text>
    </View>
  );
}
