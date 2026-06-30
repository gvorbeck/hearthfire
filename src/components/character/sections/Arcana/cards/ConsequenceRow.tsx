import { useCallback, useId } from "react";
import { Checkbox, Text } from "@/components/ui";
import { UseDots } from "@/components/ui/UseDots/UseDots";
import { consequenceMarkId, parseConsequenceMarks } from "../arcanaParsing";
import styles from "../arcanaCard.module.css";

interface ConsequenceRowProps {
  id: string;
  text: string;
  // Checked state for each mark box, in order; its length is the number of boxes to render.
  checkedMarks: boolean[];
  // Number of mark boxes, overriding the count parsed from the text's ◻-glyph prefix. Used by back
  // consequences, which carry an explicit `checkboxes` count instead of glyphs.
  markCount?: number;
  // Locks the mark boxes — e.g. a child consequence whose parent isn't marked yet.
  disabled?: boolean;
  onToggle: (id: string, checked: boolean) => void;
  // A "hold up to max" dot tracker shown after the prose (e.g. Sustenance), interactive only while the
  // consequence's first box is marked.
  tracker?: { label: string; max: number };
  trackerValue?: number;
  onTrackerChange?: (id: string, value: number) => void;
}

// Not memoized: each card renders only a handful of consequences and they change rarely, so the
// per-render `checkedMarks` array (which would defeat memo anyway) costs nothing here.
export const ConsequenceRow = ({
  id,
  text,
  checkedMarks,
  markCount: markCountOverride,
  disabled,
  onToggle,
  tracker,
  trackerValue,
  onTrackerChange,
}: ConsequenceRowProps) => {
  const { markCount: parsedCount, text: prose } = parseConsequenceMarks(text);
  const markCount = markCountOverride ?? parsedCount;
  const proseId = useId();
  const handleTracker = useCallback(
    (v: number) => onTrackerChange?.(id, v),
    [id, onTrackerChange],
  );
  // Not a <label>: each box is its own labelable control, so wrapping the shared prose in one label
  // would bind every click to only the first box. Each box is named by the prose instead (via
  // aria-labelledby, so the rendered text—not its markdown markers—is read), plus a hidden position
  // when there is more than one box.
  return (
    <div className={styles.consequenceRow}>
      <span className={styles.consequenceMarks}>
        {Array.from({ length: markCount }, (_, i) => {
          const markId = consequenceMarkId(id, i);
          const posId = `${proseId}-pos-${i}`;
          return (
            <Checkbox
              key={markId}
              checked={!!checkedMarks[i]}
              disabled={disabled}
              onChange={(e) => onToggle(markId, e.target.checked)}
              aria-labelledby={markCount > 1 ? `${proseId} ${posId}` : proseId}
            />
          );
        })}
        {markCount > 1 &&
          Array.from({ length: markCount }, (_, i) => (
            <span
              key={`${proseId}-pos-${i}`}
              id={`${proseId}-pos-${i}`}
              className={styles.srOnly}
            >
              mark {i + 1} of {markCount}
            </span>
          ))}
      </span>
      <Text as="span" id={proseId} font="serif">
        {prose}
      </Text>
      {tracker && (
        <UseDots
          total={tracker.max}
          checked={trackerValue ?? 0}
          onChange={handleTracker}
          disabled={!checkedMarks[0]}
          label={tracker.label}
        />
      )}
    </div>
  );
};
