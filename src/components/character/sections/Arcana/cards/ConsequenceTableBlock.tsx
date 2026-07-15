import { memo } from "react";
import { Table } from "@/components/ui";
import type { ConsequenceTable } from "@/types";
import styles from "../arcanaCard.module.css";

interface ConsequenceTableBlockProps {
  consequenceId: string;
  table: ConsequenceTable;
  selectedRowId?: string;
  // The table only drives an effect while its consequence is marked, so the rows stay disabled until
  // the box is checked.
  disabled: boolean;
  onChoose: (consequenceId: string, rowId: string) => void;
}

// The Mindgem's 1d4 purpose table: each row is radio-selectable, and the pick drives the row's
// effect on the creature. Rendered through the shared ui/Table with its selectable-cells rows.
export const ConsequenceTableBlock = memo(
  ({
    consequenceId,
    table,
    selectedRowId,
    disabled,
    onChoose,
  }: ConsequenceTableBlockProps) => (
    <div className={styles.consequenceTable}>
      <Table
        columnHeaders={table.columnHeaders}
        selectionLabel={table.columnHeaders.join(" ")}
        rows={table.rows.map((row) => ({
          id: row.id,
          cells: [row.roll, ...row.cells],
          ariaLabel: [row.roll, ...row.cells].join(" "),
          selectable: true,
          selected: selectedRowId === row.id,
          disabled,
          onSelect: () => onChoose(consequenceId, row.id),
        }))}
      />
    </div>
  ),
);
