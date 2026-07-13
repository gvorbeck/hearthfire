import clsx from 'clsx';
import { Radio } from '../Radio/Radio';
import styles from './Table.module.css';

type DataRow = { label: string; value: string; indent?: boolean };
type GroupRow = { group: string };
// An N-column row. When `selectable`, the row becomes a radio option: clicking it (or focusing and
// pressing space) calls `onSelect`. Used for pick-one roll tables. Cells accept rich nodes so callers
// can pass inline-formatted text (bold, italic, icons); `ariaLabel` supplies the plain-text name a
// selectable row needs for its radio, since rich cells can't be joined into a string.
type CellsRow = {
  // Stable identifier for the row's React key, since rich-node cells can't be stringified into one.
  id: string;
  cells: React.ReactNode[];
  selectable?: boolean;
  selected?: boolean;
  disabled?: boolean;
  onSelect?: () => void;
  ariaLabel?: string;
};
type Row = DataRow | GroupRow | CellsRow;

const isGroup = (row: Row): row is GroupRow => 'group' in row;
const isCells = (row: Row): row is CellsRow => 'cells' in row;

type Props = {
  rows: Row[];
  title?: string;
  // Two-column tables pass a [label, value] tuple; N-column tables pass one header per cell.
  columnHeaders?: React.ReactNode[];
  bordered?: boolean;
  // Accessible name for the radiogroup when the table contains selectable rows.
  selectionLabel?: string;
};

export const Table = ({ rows, title, columnHeaders, bordered, selectionLabel }: Props) => {
  const hasSelectable = rows.some((row) => isCells(row) && row.selectable);
  const hasCells = rows.some(isCells);
  const columnCount = columnHeaders?.length ?? 2;
  // N-column (cells) tables keep every header left-aligned; only the classic two-column label/value
  // tables right-align the trailing value column.
  const thClass = clsx(styles.tableTh, hasCells && styles.tableThStart);

  const table = (
    <table className={bordered ? styles.tableBordered : styles.table}>
      {columnHeaders && (
        <thead>
          <tr>
            {columnHeaders.map((header, i) => (
              <th
                key={`th-${i}-${typeof header === "string" ? header : ""}`}
                className={thClass}
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
      )}
      <tbody
        role={hasSelectable ? 'radiogroup' : undefined}
        aria-label={hasSelectable ? selectionLabel : undefined}
      >
        {rows.map((row, i) => {
          if (isGroup(row)) {
            return (
              <tr key={`group-${i}-${row.group}`} className={styles.tableGroupRow}>
                <td colSpan={columnCount} className={styles.tableGroupCell}>
                  {row.group}
                </td>
              </tr>
            );
          }
          if (isCells(row)) {
            const trClass = clsx(
              styles.tableCellsRow,
              row.selectable && !row.disabled && styles.tableSelectableRow,
              row.selected && styles.tableSelectedRow,
            );
            return (
              <tr key={`cells-${row.id}`} className={trClass}>
                {row.cells.map((cell, c) => (
                  <td key={`cell-${row.id}-${c}`} className={styles.tableCell}>
                    {row.selectable && c === 0 ? (
                      <Radio
                        checked={!!row.selected}
                        disabled={row.disabled}
                        onChange={row.onSelect}
                        aria-label={row.ariaLabel}
                        label={cell}
                      />
                    ) : (
                      cell
                    )}
                  </td>
                ))}
              </tr>
            );
          }
          return (
            <tr key={`row-${i}-${row.label}`}>
              <td className={row.indent ? styles.tableCellIndent : styles.tableCell}>{row.label}</td>
              <td className={styles.tableValue}>{row.value}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );

  if (bordered) {
    return (
      <div className={styles.tableWrapper}>
        {title && <div className={styles.tableTitle}>{title}</div>}
        {table}
      </div>
    );
  }

  return table;
};
