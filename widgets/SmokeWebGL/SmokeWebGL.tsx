import { env } from '@shared/config';
import styles from './styles.module.scss';

export const SmokeWebGL = () => {
  if (!env.IS_SERVER) {
    require('@shared/lib/webgl');
  }
  return <canvas id="smoke-webgl" className={styles.container} />;
};
