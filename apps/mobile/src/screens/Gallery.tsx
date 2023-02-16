import { graphql, useLazyLoadQuery } from "react-relay";
import { GalleryQuery } from "../../__generated__/GalleryQuery.graphql";
import { useCallback, useEffect } from "react";
import { Collection } from "../components/Collection";
import { FlashList, ListRenderItem } from "@shopify/flash-list";
import { SafeAreaView, View } from "react-native";
import FastImage, { Source } from "react-native-fast-image";

export function Gallery() {
  const query = useLazyLoadQuery<GalleryQuery>(
    graphql`
      query GalleryQuery {
        userByUsername(username: "mikey") {
          ... on GalleryUser {
            featuredGallery {
              dbid

              collections {
                dbid

                tokens {
                  token {
                    media {
                      ... on Media {
                        previewURLs {
                          medium
                        }
                      }
                    }
                  }
                }

                ...CollectionFragment
              }
            }
          }
        }
      }
    `,
    {}
  );

  const collections = query.userByUsername?.featuredGallery?.collections;

  if (!collections) {
    throw new Error("Yikes");
  }
  useEffect(() => {
    const allTokenSources = collections
      .flatMap((collection) => collection?.tokens ?? [])
      .map((token) => token?.token?.media?.previewURLs?.medium)
      .filter(Boolean)
      .map((url): Source => {
        return { uri: url as string };
      });

    FastImage.preload(allTokenSources);
  }, []);

  const renderItem = useCallback<ListRenderItem<(typeof collections)[number]>>(
    (info) => {
      const collection = info.item;

      if (!collection) {
        return null;
      }

      return (
        <View key={collection.dbid} style={{ marginBottom: 24 }}>
          <Collection collectionRef={collection} />
        </View>
      );
    },
    []
  );

  return (
    <SafeAreaView style={{ backgroundColor: "white", height: "100%" }}>
      <View style={{ height: "100%" }}>
        <FlashList
          estimatedItemSize={300}
          keyExtractor={(item) => item?.dbid ?? "nothing"}
          data={collections}
          renderItem={renderItem}
        />
      </View>
    </SafeAreaView>
  );
}
