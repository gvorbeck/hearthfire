import styles from './Playbook.module.css';

type DataRow = { label: string; value: string; indent?: boolean };
type GroupRow = { group: string };
type Row = DataRow | GroupRow;

const isGroup = (row: Row): row is GroupRow => 'group' in row;

type Props = {
  rows: Row[];
  title?: string;
  columnHeaders?: [string, string];
  bordered?: boolean;
};

export const PlaybookTable = ({ rows, title, columnHeaders, bordered }: Props) => {
  const inner = (
    <table className={bordered ? styles.tableBordered : styles.table}>
      {columnHeaders && (
        <thead>
          <tr>
            <th className={styles.tableTh}>{columnHeaders[0]}</th>
            <th className={styles.tableTh}>{columnHeaders[1]}</th>
          </tr>
        </thead>
      )}
      <tbody>
        {rows.map((row, i) =>
          isGroup(row) ? (
            <tr key={`group-${i}`} className={styles.tableGroupRow}>
              <td colSpan={2} className={styles.tableGroupCell}>{row.group}</td>
            </tr>
          ) : (
            <tr key={row.label}>
              <td className={row.indent ? styles.tableCellIndent : styles.tableCell}>{row.label}</td>
              <td className={styles.tableValue}>{row.value}</td>
            </tr>
          )
        )}
      </tbody>
    </table>
  );

  if (bordered) {
    return (
      <div className={styles.tableWrapper}>
        {title && <div className={styles.tableTitle}>{title}</div>}
        {inner}
      </div>
    );
  }

  return inner;
};
