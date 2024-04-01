import React from 'react';
import Head from 'next/head';
import { GoogleAnalytics } from '@next/third-parties/google';

interface AppProps {
  children: React.ReactNode;
}
const App: React.FC<AppProps> = ({ children }) => {
  return (
    <>
      <Head>
        <title>knyaka.dev</title>
        <meta name="description" content="knyaka.dev" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="canonical" href="https://knyaka.dev" />
        <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
        <meta name="robots" content="index,follow" />
      </Head>
      {children}
      <GoogleAnalytics gaId="G-NTC960VCPK" />
    </>
  );
};

export default App;
