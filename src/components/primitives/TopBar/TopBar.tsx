import { Heading } from '../Heading/Heading';
import styles from './TopBar.module.css';

export const TopBar = () => (
  <header aria-label="Site" className={styles.header}>
    <Heading as="h1" size="md" className={styles.wordmark}>Hearthfire</Heading>
  </header>
);
