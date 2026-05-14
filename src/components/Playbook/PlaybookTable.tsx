import { Text } from '@/components/primitives';
import styles from './Playbook.module.css';

type Row = { label: string; value: string };

export const PlaybookTable = ({ rows }: { rows: Row[] }) => (
  <table className={styles.table}>
    <tbody>
      {rows.map(({ label, value }) => (
        <tr key={label}>
          <td><Text>{label}</Text></td>
          <td className={styles.tableValue}><Text>{value}</Text></td>
        </tr>
      ))}
    </tbody>
  </table>
);
