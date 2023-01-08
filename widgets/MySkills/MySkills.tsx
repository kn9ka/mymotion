import cn from 'classnames';
import { Column } from '@shared/ui';
import styles from './styles.module.scss';

export const MySkills = () => {
  return (
    <Column>
      <span className={cn(styles.title, styles.mb16)}>Frontend Developer</span>
      <p className={cn(styles.text, styles.mb24)}>
        I like to code things from scratch, and enjoy bringing ideas to life in
        the browser.
      </p>
      <p className={cn(styles.text, styles.colored, styles.mb8)}>
        Languages I speak:
      </p>
      <p className={cn(styles.text, styles.mb16)}>
        HTML, CSS, Sass, Git, Typescript, Python
      </p>
      <p className={cn(styles.text, styles.colored, styles.mb8)}>Dev Tools:</p>
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
