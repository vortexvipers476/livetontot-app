import '../styles/globals.css';
import Head from 'next/head';

// Komponen utama aplikasi
function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>Nonton Bareng</title>
        <meta name="description" content="Platform nonton bareng real-time dengan teman-teman" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Component {...pageProps} />
    </>
  );
}

export default MyApp;
