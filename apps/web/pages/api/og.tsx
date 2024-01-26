import { ImageResponse } from '@vercel/og';
import { NextRequest } from 'next/server';
import { graphql, useLazyLoadQuery } from 'react-relay';
import { fetchWithJustQueryText } from 'shared/relay/network';
import styled from 'styled-components';

import { TITLE_FONT_FAMILY } from '~/components/core/Text/Text';
import { HEIGHT_OPENGRAPH_IMAGE, WIDTH_OPENGRAPH_IMAGE } from '~/constants/opengraph';
import { ogPostQuery } from '~/generated/ogPostQuery.graphql';
import colors from '~/shared/theme/colors';

import { postIdQuery } from './postIdQuery';

export const config = {
  runtime: 'edge',
};

const ABCDiatypeRegular = fetch(
  new URL('../../../../packages/shared/src/fonts/ABCDiatype-Regular.ttf', import.meta.url)
).then((res) => res.arrayBuffer());

const ABCDiatypeBold = fetch(
  new URL('../../../../packages/shared/src/fonts/ABCDiatype-Bold.ttf', import.meta.url)
).then((res) => res.arrayBuffer());

const alpinaLight = fetch(
  new URL('../../../../packages/shared/src/fonts/GT-Alpina-Standard-Light.otf', import.meta.url)
).then((res) => res.arrayBuffer());

type UrlSet = {
  small: string | null;
  medium: string | null;
  large: string | null;
};

export default async function handler(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  const postId = searchParams.get('postId') ?? '';
  let postImageUrl =
    'https://assets.gallery.so/https%3A%2F%2Fstorage.googleapis.com%2Fprod-token-content%2F4-292cd-KT1EfsNuqwLAWDd3o4pvfUx1CAh5GMdTrRvr-image?auto=compress%2Cformat&fit=max&glryts=1705844681&w=1024&s=9076d07060aeb7ac31297a0381bd0ed3';
 // const caption = 'grain:street #63 by nekropunk';

  const queryResponse = await fetchWithJustQueryText({
    queryText: postIdQuery,
    variables: { postId: postId },
  });

  if (!postId || !queryResponse?.data?.post) {
    return new ImageResponse(<>Visit gallery.so;</>, {
      width: 1200,
      height: 630,
    });
  }

  const post = queryResponse.data.post;
  const author = post.author;
  const firstLetter = author?.username?.substring(0, 1).toUpperCase() ?? '';

  let profileImageUrl = null;
  const { token: profileToken, profileImage } = post?.author?.profileImage ?? {};

  if (profileImage && profileImage.previewURLs?.medium) {
    profileImageUrl = profileImage.previewURLs.medium;
  }

  const media = profileToken?.definition?.media;

  let previewUrls: UrlSet | null = null;

  if (!profileToken) {
    return null;
  }

  if (
    media &&
    'previewURLs' in media &&
    media.previewURLs &&
    (media.previewURLs.small || media.previewURLs.medium || media.previewURLs.large)
  ) {
    previewUrls = media.previewURLs;
  } else if ('fallbackMedia' in media) {
    if (media.fallbackMedia?.mediaURL) {
      previewUrls = {
        small: media.fallbackMedia.mediaURL,
        medium: media.fallbackMedia.mediaURL,
        large: media.fallbackMedia.mediaURL,
      };
    }
  }

  profileImageUrl = previewUrls?.small;

  const postToken = post.tokens?.[0];
  if (!postToken) {
    return null;
  }

  const postMedia = postToken?.definition?.media;
  let postPreviewUrls: UrlSet | null = null;

  if (
    postMedia &&
    'previewURLs' in postMedia &&
    postMedia.previewURLs &&
    (postMedia.previewURLs.small || postMedia.previewURLs.medium || postMedia.previewURLs.large)
  ) {
    postPreviewUrls = postMedia.previewURLs;
  } else if ('fallbackMedia' in media) {
    if (media.fallbackMedia?.mediaURL) {
      postPreviewUrls = {
        small: media.fallbackMedia.mediaURL,
        medium: media.fallbackMedia.mediaURL,
        large: media.fallbackMedia.mediaURL,
      };
    }
  }

  postImageUrl = postPreviewUrls?.large ?? '';

  const ABCDiatypeRegularFontData = await ABCDiatypeRegular;
  const ABCDiatypeBoldFontData = await ABCDiatypeBold;
  const alpinaLightFontData = await alpinaLight;

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          gap: '70px',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#fff',
        }}
      >
        <svg
          style={{ width: '56.74px', height: '196px' }}
          width="40"
          height="121"
          viewBox="0 0 36 121"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M33.3845 120.5C-4.79681 97.5124 -11.3149 43.5986 19.4718 11.6054C22.5802 8.39033 25.9865 5.47922 29.6447 2.91146C30.5382 2.3054 32.4485 1.05912 33.3845 0.500008L35.0311 3.09922C16.1957 15.7113 4.47411 37.8411 4.63154 60.5C4.47411 83.159 16.1957 105.314 35.0311 117.901L33.3845 120.5Z"
            fill="#141414"
          />
        </svg>
        <div
          style={{
            display: 'flex',
            gap: '70px',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <img
            width="370"
            src={postImageUrl}
            style={{
              maxWidth: '370px',
              maxHeight: '370px',
              display: 'block',
            }}
            alt="post"
          />
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              {profileImageUrl ? (
                <img
                  width="48"
                  height="48"
                  src={profileImageUrl}
                  style={{
                    borderRadius: 30,
                  }}
                  alt="profile picture"
                />
              ) : (
                <div
                  style={{
                    height: 48,
                    width: 48,
                    fontSize: 28,
                    borderWidth: 1,
                    borderColor: 'black',
                    fontFamily: "'GT Alpina'",

                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    borderRadius: '999999999px',
                  }}
                >
                  {firstLetter}
                </div>
              )}
              <h1
                style={{
                  fontSize: '32px',
                  lineHeight: '36px',
                  fontFamily: "'ABCDiatype-Bold'",
                  letterSpacing: '-0.01em',
                  margin: '0',
                  paddingBottom: 4,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {author?.username}
              </h1>
            </div>
            <div
              style={{
                display: 'flex',
                lineHeight: '32px',
              }}
            >
              <p
                style={{
                  fontFamily: "'ABCDiatype-Regular'",
                  fontSize: '25px',
                  fontWeight: 400,
                  lineHeight: '32px',
                  display: '-webkit-box',
                  WebkitBoxOrient: 'vertical',
                  WebkitLineClamp: 5,
                  wordBreak: 'break-all',
                  maxWidth: '350px',
                  margin: 0,
                }}
              >
                {post?.caption}
              </p>
            </div>
          </div>
        </div>
        <svg
          style={{ width: '56.74px', height: '196px' }}
          width="20"
          height="194"
          viewBox="0 0 36 121"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M2.61129 0.500008C40.7972 23.4876 47.3153 77.4014 16.5284 109.395C13.4189 112.609 10.0126 115.52 6.35534 118.089C5.4576 118.695 3.55158 119.941 2.61555 120.5L0.968933 117.901C19.8045 105.289 31.5261 83.159 31.3687 60.5C31.5261 37.8411 19.8045 15.7113 0.968933 3.09922L2.61129 0.500008Z"
            fill="#141414"
          />
        </svg>
      </div>
    ),
    {
      width: WIDTH_OPENGRAPH_IMAGE,
      height: HEIGHT_OPENGRAPH_IMAGE,
      fonts: [
        {
          name: 'ABCDiatype-Regular',
          data: ABCDiatypeRegularFontData,
          weight: 400,
        },
        {
          name: 'ABCDiatype-Bold',
          data: ABCDiatypeBoldFontData,
          weight: 700,
        },
        {
          name: 'GT Alpina',
          data: alpinaLightFontData,
          style: 'normal',
          weight: 500,
        },
      ],
    }
  );
}
