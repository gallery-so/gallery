import { ImageResponse } from '@vercel/og';
import { NextRequest } from 'next/server';

import styled from 'styled-components';
import { TITLE_FONT_FAMILY } from '~/components/core/Text/Text';
import colors from '~/shared/theme/colors';

export const config = {
  runtime: 'edge',
};

export default async function handler(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const username = searchParams.get('username');
  const postImageUrl =
    'https://assets.gallery.so/https%3A%2F%2Fstorage.googleapis.com%2Fprod-token-content%2F4-292cd-KT1EfsNuqwLAWDd3o4pvfUx1CAh5GMdTrRvr-image?auto=compress%2Cformat&fit=max&glryts=1705844681&w=1024&s=9076d07060aeb7ac31297a0381bd0ed3';
  /*
       if (reza) {
           pfpUrl = 'https://assets.gallery.so/https%3A%2F%2Fstorage.googleapis.com%2Fprod-token-content%2F0-38d774de387330a762733280388221c7e5906df44aacef44c452a8a422ccfbb2-0x57f1887a8bf19b14fc0df6fd9b2acc9af147ea85-thumbnail?auto=format%2Ccompress&fit=max&glryts=1697105205&w=204&s=87c67d480c26b46973f67ba466d0b09f'
           caption = 'LIFE BETWEEN BORDERS.\n #ThemeOfTheWeek \n Their greatest distinguishing feature is their hospitality. They welcome you as a member of their family and treat you as such'
       }
  */

  const caption = 'grain:street #63 by nekropunk';
  const firstLetter = username?.substring(0, 1).toUpperCase() ?? '';
  const profileImageUrl = null;

  if (!username) {
    return new ImageResponse(<>Visit gallery.so;</>, {
      width: 1200,
      height: 630,
    });
  }

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          gap: '60px',
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
                width="40"
                height="40"
                src={profileImageUrl}
                style={{
                  borderRadius: 30,
                }}
                alt="profile picture"
              />
            ) : (
              <div
                style={{
                  height: 32,
                  width: 32,
                  fontSize: 12,
                  borderWidth: 1,
                  borderColor: 'black',
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
                fontSize: '24px',
                fontWeight: 600,
                lineHeight: '36px',
                fontFamily: "'ABC Diatype', Helvetica, Arial, sans-serif",
                letterSpacing: '-0.01em',
                margin: '0',
              }}
            >
              {username}
            </h1>
          </div>
          <div
            style={{
              display: 'flex',
              fontSize: '26px',
              lineHeight: '32px',
            }}
          >
            <p
              style={{
                fontFamily: "'ABC Diatype', Helvetica, Arial, sans-serif",
                fontSize: '22px',
                fontWeight: 400,
                lineHeight: '32px',
                overflow: 'hidden',
                display: '-webkit-box',
                WebkitBoxOrient: 'vertical',
                WebkitLineClamp: 5,
                maxWidth: '350px',
                whiteSpace: 'pre-line',
                margin: 0,
              }}
            >
              {caption}
            </p>
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
      width: 1200,
      height: 630,
    }
  );
}

const ProfilePictureText = styled.div`
  user-select: none;

  font-size: 12px;
  font-weight: 300;
  line-height: 13px;
  font-family: ${TITLE_FONT_FAMILY};
  color: ${colors.black['800']};
  display: inline-block;
`;
