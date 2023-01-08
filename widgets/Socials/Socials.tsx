import cn from 'classnames';
import Image from 'next/image';
import styles from './styles.module.scss';

export const Socials = () => {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <a
          className={styles.network}
          href="https://t.me/knyaka"
          target="_blank"
          rel="noreferrer"
        >
          <Image src="/socials/telegram.svg" width={40} height={40} alt="" />
        </a>
        <a
          className={styles.network}
          href="https://discordapp.com/users/232159043194454016"
          target="_blank"
          rel="noreferrer"
        >
          <Image src="/socials/discord.svg" width={40} height={40} alt="" />
        </a>
        <a
          className={styles.network}
          href="https://www.linkedin.com/in/anton-krachkov-57a038b8/"
          target="_blank"
          rel="noreferrer"
        >
          <Image src="/socials/linkedin.svg" width={40} height={40} alt="" />
        </a>
        <a
          className={styles.network}
          href="https://github.com/kn9ka"
          target="_blank"
          rel="noreferrer"
        >
          <Image src="/socials/github.svg" width={40} height={40} alt="" />
        </a>
        <a
          className={styles.network}
          href="https://steamcommunity.com/id/kn9ka"
          target="_blank"
          rel="noreferrer"
        >
          <Image src="/socials/steam.svg" width={40} height={40} alt="" />
        </a>
        <a
          className={cn(styles.network, styles.square)}
          href="https://career.habr.com/kn9ka"
          target="_blank"
          rel="noreferrer"
        >
          <Image src="/socials/habr.svg" width={40} height={40} alt="" />
        </a>
        <a
          className={styles.network}
          href="https://vk.com/kn9ka"
          target="_blank"
          rel="noreferrer"
        >
          <Image src="/socials/vk.svg" width={40} height={40} alt="" />
        </a>
      </div>
    </div>
  );
};
