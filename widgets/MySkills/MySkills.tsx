import { clsx } from 'clsx';
import { Column } from '@shared/ui';
import styles from './styles.module.scss';

export const MySkills = () => {
  return (
    <Column>
      <span className={clsx(styles.title, styles.mb16)}>
        Frontend Developer
      </span>
      <p className={clsx(styles.text, styles.mb24)}>
        I like to code things from scratch, and enjoy bringing ideas to life in
        the browser.
      </p>
      <p className={clsx(styles.text, styles.colored, styles.mb8)}>
        Languages I speak:
      </p>
      <p className={clsx(styles.text, styles.mb16)}>
        HTML, CSS, Sass, Git, Typescript, Python
      </p>
      <p className={clsx(styles.text, styles.colored, styles.mb8)}>
        Dev Tools:
      </p>
      <ul className={styles.list}>
        <li>React</li>
        <li>Webpack</li>
        <li>Github</li>
        <li>Gitlab</li>
        <li>Bitbucket</li>
      </ul>
    </Column>
  );
};
