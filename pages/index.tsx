import Head from 'next/head';
import { useEffect } from 'react';
import cn from 'classnames';
import { Open_Sans } from '@next/font/google';
import { MySkills } from '@widgets/MySkills';
import { Socials } from '@widgets/Socials';
import { Gamer } from '@widgets/Gamer';
import { SmokeWebGL } from '@widgets/SmokeWebGL';
import { ScrollDown } from '@shared/ui/ScrollDown';

import styles from '../styles/Home.module.scss';

const inter = Open_Sans({ subsets: ['latin'] });

export default function Home() {
  return (
    <>
      <Head>
        <title>knyaka</title>
        <meta name="description" content="knyaka" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={cn(styles.main, inter.className)}>
        <section
          id="webgl"
          className={cn(styles.section, styles.withoutMaxWidth)}
        >
          <div className={styles.canvasWrapper}>
            <SmokeWebGL />
          </div>
          <div className={styles.title}>
            <h1 className={inter.className}>
              Hi, I&apos;m Anton, I develop awesome websites!
            </h1>
          </div>
          <ScrollDown href="#description" />
        </section>
        <section id="description" className={styles.section}>
          <h1 className={cn(inter.className, styles.description)}>
            Since beginning my journey as frontend developer over 5 years ago, I
            have collaborated with talented people to create digital products
            for both businesses and consumers. I&apos;m quietly confident,
            naturally curious and constantly working to improve my skills
          </h1>
        </section>
        <section id="skills" className={styles.section}>
          <div className={styles.row}>
            <MySkills />
            <Gamer />
          </div>
        </section>
        <section id="socials" className={styles.section}>
          <Socials />
        </section>
      </main>
    </>
  );
}
