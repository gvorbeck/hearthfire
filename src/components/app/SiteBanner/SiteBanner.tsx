import { type ReactNode } from 'react';
import { Text } from '@/components/ui';
import styles from './SiteBanner.module.css';

interface SiteBannerProps {
  children: ReactNode;
}

export const SiteBanner = ({ children }: SiteBannerProps) => (
  <div className={styles.banner}>
    <Text size="xs">{children}</Text>
  </div>
);
