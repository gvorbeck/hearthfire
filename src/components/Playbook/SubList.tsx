import { Text } from '@/components/primitives';
import styles from './Playbook.module.css';

export const SubList = ({ items }: { items: string[] }) => (
  <ul className={styles.subList}>
    {items.map(item => (
      <li key={item}><Text>{item}</Text></li>
    ))}
  </ul>
);
