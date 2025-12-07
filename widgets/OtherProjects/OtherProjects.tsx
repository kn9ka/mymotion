import { Column } from '@shared/ui';
import { clsx } from 'clsx';
import styles from './styles.module.scss';

export const OtherProjects = () => {
  return (
    <Column>
      <span className={clsx(styles.title, styles.mb16)}>My projects</span>
      <ul className={styles.list}>
        <li className={styles.mb8}>
          <a className={styles.colored} href="https://1cebit.com">
            Crypto Exchange
          </a>
        </li>
        <li className={styles.mb8}>
          <a className={styles.colored} href="https://lks.domclick.ru">
            Mortgage personnal cabinet
          </a>
        </li>
        <li className={styles.mb8}>
          <a
            className={styles.colored}
            href="https://exchange-rates.knyaka.dev"
          >
            Exchange rates
          </a>
        </li>
        <li className={styles.mb8}>
          <a className={styles.colored} href="https://voice-memos.knyaka.dev">
            Voice memos
          </a>
        </li>
        <li className={styles.mb8}>
          <a
            className={styles.colored}
            href="https://vocabulary-trainer.knyaka.dev"
          >
            Vocabulary trainer
          </a>
        </li>
        <li className={styles.mb8}>
          <a
            className={styles.colored}
            href="https://product-list-lime.vercel.app"
          >
            Product list
          </a>
        </li>
        <li>and many others...</li>
      </ul>
    </Column>
  );
};
