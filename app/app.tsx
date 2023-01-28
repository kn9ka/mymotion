import React from 'react';
import Head from 'next/head';

interface AppProps {
  children: React.ReactNode;
}
const App: React.FC<AppProps> = ({ children }) => {
  return (
    <>
      <Head>
        <title>knyaka</title>
        <meta name="description" content="knyaka" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {children}
    </>
  );
};

export default App;
