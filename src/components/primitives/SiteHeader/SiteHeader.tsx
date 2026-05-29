import { Heading } from '../Heading/Heading';
import styles from './SiteHeader.module.css';

export const SiteHeader = () => (
  <header aria-label="Site" className={styles.header}>
    <Heading as="h1" size="md" className={styles.wordmark}>Hearthfire</Heading>
  </header>
);
