import { graphql, useLazyLoadQuery } from "react-relay";
import { SafeAreaView, ScrollView, Text, View } from "react-native";
import { GalleryQuery } from "../../__generated__/GalleryQuery.graphql";
import { ResizeMode, Video } from "expo-av";
import { useEffect, useRef } from "react";

export function Gallery() {
  const query = useLazyLoadQuery<GalleryQuery>(
    graphql`
      query GalleryQuery {
        userByUsername(username: "percyio") {
          ... on GalleryUser {
            featuredGallery {
              dbid

              collections {
                layout {
                  sections
                  sectionLayout {
                    columns
                    whitespace
                  }
                }
                tokens {
                  token {
                    name
                    media {
                      __typename

                      ... on VideoMedia {
                        contentRenderURLs {
                          large
                        }
                      }

                      ... on ImageMedia {
                        previewURLs {
                          large
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    `,
    {}
  );

  console.log(query.userByUsername?.featuredGallery);

  const collections = query.userByUsername?.featuredGallery?.collections;

  return (
    <SafeAreaView style={{ backgroundColor: "#eee", height: "100%" }}>
      <View style={{ height: "100%" }}>
        <ScrollView style={{ overflow: "hidden" }} decelerationRate="fast">
          {collections?.map((collection) => {
            const tokens = collection?.tokens;

            return (
              <View>
                {tokens?.map((token) => {
                  console.log(token?.token?.media?.__typename);

                  if (token?.token?.media?.__typename === "VideoMedia") {
                    console.log(token?.token.media.contentRenderURLs);
                    return (
                      <View>
                        <Text>{token?.token?.name}</Text>

                        <Video
                          style={{ width: "100%", height: 400 }}
                          onReadyForDisplay={console.log}
                          shouldPlay
                          onLoad={console.log}
                          source={{
                            uri:
                              token?.token.media.contentRenderURLs?.large ?? "",
                          }}
                          resizeMode={ResizeMode.CONTAIN}
                          isLooping
                        />
                      </View>
                    );
                  }

                  return null;
                })}
              </View>
            );
          })}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
