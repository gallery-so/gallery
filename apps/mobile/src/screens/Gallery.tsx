import { graphql, useLazyLoadQuery } from "react-relay";
import { FlatList, ListRenderItem, SafeAreaView, View } from "react-native";
import { GalleryQuery } from "../../__generated__/GalleryQuery.graphql";
import { useCallback, useEffect } from "react";
import { Collection } from "../components/Collection";
import { Image } from "expo-image";

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
                      ... on ImageMedia {
                        previewURLs {
                          large
                        }
                      }
                      ... on HtmlMedia {
                        previewURLs {
                          large
                        }
                      }
                      ... on GIFMedia {
                        previewURLs {
                          large
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
    const allTokenImages = collections
      .flatMap((collection) => collection?.tokens ?? [])
      .map((token) => token?.token?.media?.previewURLs?.large)
      .filter(Boolean) as string[];

    console.log("Prefetching");
    console.log(JSON.stringify(allTokenImages));

    Image.prefetch(allTokenImages);
  }, []);

  const renderItem = useCallback<ListRenderItem<(typeof collections)[number]>>(
    (info) => {
      const collection = info.item;

      if (!collection) {
        return null;
      }

      return (
        <View key={collection.dbid} style={{ marginBottom: 24 }}>
          <Collection key={collection.dbid} collectionRef={collection} />
        </View>
      );
    },
    []
  );

  return (
    <SafeAreaView style={{ backgroundColor: "white", height: "100%" }}>
      <View style={{ height: "100%" }}>
        <FlatList
          windowSize={2}
          keyExtractor={(item) => item?.dbid ?? "nothing"}
          data={collections}
          renderItem={renderItem}
        />
      </View>
    </SafeAreaView>
  );
}
