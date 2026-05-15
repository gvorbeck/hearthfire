import styles from '../CharacterSheet.module.css';

const SacredPouch = () => (
  <section className={styles.section}>
    <div className={styles.sectionTitle}>Sacred Pouch</div>
    <div className={styles.placeholder} />
  </section>
);

const TheEarthMother = () => (
  <section className={styles.section}>
    <div className={styles.sectionTitle}>The Earth Mother</div>
    <div className={styles.placeholder} />
  </section>
);

export const BlessedSections = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-6)' }}>
    <SacredPouch />
    <TheEarthMother />
  </div>
);
