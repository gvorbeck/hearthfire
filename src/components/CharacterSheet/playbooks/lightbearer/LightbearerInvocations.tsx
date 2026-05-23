import { PlaybookSection } from "../../PlaybookSection";
import { Move } from "../../Move";
import { usePlaybookChecked } from "@/hooks/usePlaybookChecked";
import { LIGHTBEARER_INVOCATIONS } from "@/lib/lightbearerInvocations";
import { parseInlineMarkdown } from "@/lib/parseMarkdown";
import type { CharacterData } from "@/types";
import styles from "./LightbearerInvocations.module.css";

const INTRO_LINES = [
  "Lightbearer, you start knowing 2 Invocations. Each time you reach an even-numbered level, learn 1 new Invocation.",
  "While one Invocation is *ongoing*, you can't use another. You can end an Invocation whenever you wish, and it will end immediately if your holy light is extinguished. An Invocation's range is equal to that of its light source.",
];

interface LightbearerInvocationsProps {
  data: CharacterData | undefined;
  onSave: (data: Partial<CharacterData>) => Promise<void>;
}

export const LightbearerInvocations = ({
  data,
  onSave,
}: LightbearerInvocationsProps) => {
  const { checked, handleChange } = usePlaybookChecked(
    data,
    onSave,
    "lightbearerInvocations",
  );

  const sorted = [
    ...LIGHTBEARER_INVOCATIONS.filter((inv) => checked[inv.id]),
    ...LIGHTBEARER_INVOCATIONS.filter((inv) => !checked[inv.id]),
  ];

  return (
    <PlaybookSection title="Invocations">
      <div className={styles.intro}>
        {INTRO_LINES.map((line) => (
          <p key={line}>{parseInlineMarkdown(line)}</p>
        ))}
      </div>
      <div className={styles.grid}>
        {sorted.map((inv) => (
          <Move
            key={inv.id}
            move={inv}
            selected={checked[inv.id] ?? false}
            onSelectChange={(val) => handleChange(inv.id, val)}
          />
        ))}
      </div>
    </PlaybookSection>
  );
};
