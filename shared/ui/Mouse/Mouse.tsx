import styles from './styles.module.scss';

export const Mouse = ({ onClick }: { onClick: () => any }) => {
  return <div className={styles.container} onClick={onClick} />;
};
