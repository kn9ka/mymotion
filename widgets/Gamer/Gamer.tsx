import cn from 'classnames';
import { Column } from '@shared/ui';
import styles from './styles.module.scss';

export const Gamer = () => {
  return (
    <Column>
      <span className={cn(styles.title, styles.mb16)}>Hardcore Gamer</span>
      <p className={cn(styles.text, styles.mb24)}>
        The rest of my free time I devote entirely to games and communities
      </p>
      <p className={cn(styles.text, styles.colored, styles.mb8)}>
        Games I play
      </p>
      <ul className={styles.list}>
        <li>CS:GO and previous including 1.3</li>
        <li>DOTA 2</li>
        <li>Lineage 2</li>
        <li>World of Warcraft</li>
        <li>New world</li>
        <li>Revelation Online (CN / RU)</li>
        <li>Hades</li>
        <li>Warm Snow</li>
        <li>Sword of legends online</li>
        <li>EVE Online</li>
        <li>DMC!</li>
        <li>ARK</li>
        <li>Call of Duty</li>
        <li>PUBG</li>
      </ul>
    </Column>
  );
};
