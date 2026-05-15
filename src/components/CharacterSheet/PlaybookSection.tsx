import styles from './CharacterSheet.module.css';

interface PlaybookSectionProps {
  title: string;
  choose?: number;
  children?: React.ReactNode;
}

export const PlaybookSection = ({ title, choose, children }: PlaybookSectionProps) => (
  <section className={styles.section}>
    <div className={styles.sectionTitle}>
      {title}
      {choose !== undefined && (
        <span className={styles.sectionTitleChoose}>(Choose {choose})</span>
      )}
    </div>
    {children}
  </section>
);
