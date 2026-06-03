import { Toggle, Icon } from '@/components/ui';
import { useColorScheme } from '@/hooks/useColorScheme';
import styles from './ThemeToggle.module.css';

export const ThemeToggle = () => {
  const { scheme, toggle } = useColorScheme();
  const isLight = scheme === 'light';

  return (
    <div className={styles.wrapper}>
      <Icon name="moon" size="small" className={!isLight ? styles.iconActive : undefined} />
      <Toggle
        aria-label={isLight ? 'Switch to dark mode' : 'Switch to light mode'}
        checked={isLight}
        onChange={toggle}
      />
      <Icon name="sun" size="small" className={isLight ? styles.iconActive : undefined} />
    </div>
  );
};
