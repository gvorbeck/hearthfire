import styles from './CharacterSheet.module.css';

interface PlaybookSectionProps {
  title: string;
  children?: React.ReactNode;
}

export const PlaybookSection = ({ title, children }: PlaybookSectionProps) => (
  <section className={styles.section}>
    <div className={styles.sectionTitle}>{title}</div>
    {children}
  </section>
);
