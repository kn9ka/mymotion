import { useEffect } from 'react';
import Head from 'next/head';
import cn from 'classnames';
import { Open_Sans } from '@next/font/google';
import { MySkills } from '@widgets/MySkills';
import { Socials } from '@widgets/Socials';
import { Gamer } from '@widgets/Gamer';
import { Mouse } from '@shared/ui/Mouse';
import styles from '../styles/Home.module.scss';

const inter = Open_Sans({ subsets: ['latin'] });

const isServer = typeof window === 'undefined';

export default function Home() {
  useEffect(() => {
    if (!isServer) {
      require('../shared/lib/webgl');
    }
  }, []);

  const handleScroll = () => {
    if (!isServer) {
      window.scrollBy(0, window.innerHeight);
    }
  };

  return (
    <>
      <Head>
        <title>knyaka</title>
        <meta name="description" content="knyaka" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={cn(styles.main, inter.className)}>
        <div className={styles.block}>
          <div className={styles['canvas-wrapper']}>
            <canvas />
          </div>
          <div className={styles.title}>
            <h1 className={inter.className}>
              Hi, I&apos;m Anton, I develop awesome websites!
            </h1>
          </div>
          <div className={styles.scrolldown}>
            <Mouse onClick={handleScroll} />
          </div>
        </div>
        <div className={styles.block}>
          <h1 className={cn(inter.className, styles.description)}>
            Since beginning my journey as frontend developer over 5 years ago, I
            have collaborated with talented people to create digital products
            for both businesses and consumers. I&apos;m quietly confident,
            naturally curious and constantly working to improve my skills
          </h1>
        </div>
        <div className={styles.block}>
          <div className={styles.row}>
            <MySkills />
            <Gamer />
          </div>
        </div>
        <div className={styles.block}>
          <Socials />
        </div>
      </main>
    </>
  );
}
