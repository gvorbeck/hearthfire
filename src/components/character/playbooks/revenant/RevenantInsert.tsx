import { useCallback, useMemo } from "react";
import { InsertLayout } from "../shared/InsertLayout";
import { RadioSelect } from "../../sections/RadioSelect";
import type {
  CharacterData,
  PlaybookSectionProps,
} from "@/types";
import { REVENANT_MOVES, REVENANT_CONSEQUENCE_LABELS } from "@/lib/moves/inserts";

const STRANGE_APPETITES_ID = "strange-appetites";
const INSATIABLE_ID = "insatiable";

const STRANGE_APPETITE_PICKS = [
  { value: "blood", label: "still-warm blood" },
  { value: "marrow", label: "bone & marrow" },
  { value: "dying-breaths", label: "dying breaths" },
  { value: "brains", label: "brains" },
  { value: "rotting-meat", label: "rotting meat" },
  { value: "eyes", label: "eyes" },
];

const REVENANT_KEYS = {
  instinct: "revenantInstinct",
  purpose: "revenantPurpose",
  purposeName: "revenantPurposeName",
} as const;

const isConsequenceDisabled = (id: string, checked: Record<string, boolean>) =>
  (id === INSATIABLE_ID && !checked[STRANGE_APPETITES_ID]) ||
  (id === "unstable" && !checked["breakdown"]);

interface StrangeAppetitesPickerProps {
  consequences: Record<string, boolean>;
  updateChecked: (
    updater: (prev: Record<string, boolean>) => Record<string, boolean>,
  ) => void;
}

const StrangeAppetitesPicker = ({
  consequences,
  updateChecked,
}: StrangeAppetitesPickerProps) => {
  const currentPick =
    Object.keys(consequences)
      .find((k) => k.startsWith("appetite:"))
      ?.replace("appetite:", "") ?? "";

  const handleSave = useCallback(
    (patch: Partial<CharacterData>) => {
      const val = patch.instinct ?? "";
      updateChecked((prev) => {
        const next: Record<string, boolean> = {};
        for (const [k, v] of Object.entries(prev)) {
          if (!k.startsWith("appetite:")) next[k] = v;
        }
        if (val) next[`appetite:${val}`] = true;
        return next;
      });
      return Promise.resolve();
    },
    [updateChecked],
  );

  const radioData = useMemo(
    () => ({ instinct: currentPick, instinctCustom: "" }) as CharacterData,
    [currentPick],
  );

  return (
    <RadioSelect
      playbookKey="revenant-appetite"
      title="Strange Appetites — Pick 1"
      options={STRANGE_APPETITE_PICKS}
      data={radioData}
      onSave={handleSave}
      noCustom
    />
  );
};

type RevenantInsertProps = PlaybookSectionProps;

export const RevenantInsert = ({ data, onSave }: RevenantInsertProps) => {
  const consequenceAddon = useCallback(
    ({
      consequences,
      updateChecked,
    }: Parameters<
      NonNullable<React.ComponentProps<typeof InsertLayout>["consequenceAddon"]>
    >[0]) => {
      if (!consequences[STRANGE_APPETITES_ID]) return null;
      return (
        <StrangeAppetitesPicker
          consequences={consequences}
          updateChecked={updateChecked}
        />
      );
    },
    [],
  );

  return (
    <InsertLayout
      playbookName="revenant"
      data={data}
      onSave={onSave}
      sectionKeys={REVENANT_KEYS}
      moves={REVENANT_MOVES}
      consequenceKey="revenantConsequences"
      consequenceLabels={REVENANT_CONSEQUENCE_LABELS}
      isConsequenceDisabled={isConsequenceDisabled}
      consequenceAddon={consequenceAddon}
    />
  );
};
