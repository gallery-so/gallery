import { ReactNode } from 'react';
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';

type Props = { children: ReactNode };

export default function ReCaptchaProvider({ children }: Props) {
  if (typeof process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY !== 'string') {
    throw new Error('Error: recaptcha client key not provided in ReCaptchaProvider');
  }

  return (
    <GoogleReCaptchaProvider
      reCaptchaKey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}
      scriptProps={{
        async: false,
        defer: false,
        appendTo: 'head',
        nonce: undefined,
      }}
    >
      {children}
    </GoogleReCaptchaProvider>
  );
}
