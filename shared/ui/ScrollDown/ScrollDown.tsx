import styles from './styles.module.scss';

export const ScrollDown = ({
  onClick,
  href,
}: {
  onClick?: () => any;
  href?: string;
}) => {
  const handleClick = (e) => {
    e.preventDefault();

    if (href) {
      document.getElementById(href?.replace('#', ''))?.scrollIntoView();
    }
    if (typeof onClick === 'function') {
      onClick();
    }
  };
  return (
    <a className={styles.container} onClick={handleClick} href={href}>
      <span />
    </a>
  );
};
