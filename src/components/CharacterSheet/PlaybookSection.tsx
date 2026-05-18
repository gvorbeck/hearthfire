import { Heading } from '@/components/primitives';
import styles from './CharacterSheet.module.css';

interface PlaybookSectionProps {
  title: string;
  choose?: number;
  chooseNote?: string;
  children?: React.ReactNode;
}

export const PlaybookSection = ({ title, choose, chooseNote, children }: PlaybookSectionProps) => (
  <section className={styles.section}>
    <Heading as="h3" size="label" className={styles.sectionTitle}>
      {title}
      {choose !== undefined && (
        <span className={styles.sectionTitleChoose}>
          (Choose {choose}{chooseNote ? `, ${chooseNote}` : ''})
        </span>
      )}
    </Heading>
    {children}
  </section>
);
