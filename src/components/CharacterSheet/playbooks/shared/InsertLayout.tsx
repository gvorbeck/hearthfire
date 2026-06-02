import { useCallback, type ReactNode } from 'react';
import { CheckboxGroup, Text, useToast } from '@/components/primitives';
import { PlaybookSection } from '../../PlaybookSection';
import { Move } from '../../Move';
import type { MoveDefinition } from '@/types';
import { PurposeDetail } from './InsertSections';
import { RadioSelect } from '../../sections/RadioSelect';
import { INSERT_INSTINCT_OPTIONS, INSERT_PURPOSE_OPTIONS } from '@/lib/insertSharedData';
import { useInsertSections } from './useInsertSections';
import { useConsequenceCheckboxes } from './useConsequenceCheckboxes';
import type { CharacterData, PlaybookFeatures } from '@/types';
import type { RadioOption } from '@/types';
import styles from './InsertLayout.module.css';

type ConsequenceKey = Extract<{
  [K in keyof PlaybookFeatures]: PlaybookFeatures[K] extends Record<string, boolean> | undefined ? K : never;
}[keyof PlaybookFeatures], string>;

interface ConsequenceLabel {
  id: string;
  label: string;
}

interface InsertSectionKeys {
  instinct: keyof PlaybookFeatures;
  purpose: keyof PlaybookFeatures;
  purposeName: keyof PlaybookFeatures;
}

interface InsertLayoutProps {
  playbookName: string;
  data: CharacterData | undefined;
  onSave: (data: Partial<CharacterData>) => Promise<void>;
  sectionKeys: InsertSectionKeys;
  moves: MoveDefinition[];
  consequenceKey: ConsequenceKey;
  consequenceLabels: ConsequenceLabel[];
  isConsequenceDisabled?: (id: string, checked: Record<string, boolean>) => boolean;
  consequenceAddon?: (props: {
    consequences: Record<string, boolean>;
    saveImmediate: (patch: Partial<PlaybookFeatures>) => Promise<void>;
    updateChecked: (updater: (prev: Record<string, boolean>) => Record<string, boolean>) => void;
  }) => ReactNode;
  checkboxGroupItemGap?: 'sm' | 'md' | 'lg';
}

export const InsertLayout = ({
  playbookName,
  data,
  onSave,
  sectionKeys,
  moves,
  consequenceKey,
  consequenceLabels,
  isConsequenceDisabled,
  consequenceAddon,
  checkboxGroupItemGap,
}: InsertLayoutProps) => {
  const { addToast } = useToast();
  const {
    instinct, setInstinct, purpose, setPurpose, purposeNames,
    handlePurposeNameChange, handlePurposeNameBlur,
    saveImmediate,
  } = useInsertSections(data, onSave, sectionKeys);

  const {
    checked: consequences,
    items: consequenceCheckboxItems,
    onChange: handleConsequenceChange,
    updateChecked,
  } = useConsequenceCheckboxes(
    data,
    saveImmediate,
    consequenceKey,
    consequenceLabels,
    isConsequenceDisabled,
  );

  const handleInstinctSave = useCallback(
    (patch: Partial<CharacterData>) => {
      const prev = instinct;
      setInstinct(patch.instinct ?? '');
      return saveImmediate({ [sectionKeys.instinct]: patch.instinct ?? '' }).catch(() => { setInstinct(prev); addToast('Failed to save.', 'error'); });
    },
    [saveImmediate, instinct, setInstinct, sectionKeys.instinct, addToast],
  );

  const handlePurposeSave = useCallback(
    (patch: Partial<CharacterData>) => {
      const prev = purpose;
      setPurpose(patch.instinct ?? '');
      return saveImmediate({ [sectionKeys.purpose]: patch.instinct ?? '' }).catch(() => { setPurpose(prev); addToast('Failed to save.', 'error'); });
    },
    [saveImmediate, purpose, setPurpose, sectionKeys.purpose, addToast],
  );

  const instinctOptions = INSERT_INSTINCT_OPTIONS.map((opt) => ({ value: opt.value, label: opt.label, description: opt.description }));

  const purposeOptions = INSERT_PURPOSE_OPTIONS.map((opt): RadioOption => ({
    value: opt.value,
    label: opt.label,
    detail: (
      <PurposeDetail
        opt={opt}
        nameValue={purposeNames[opt.value] ?? ''}
        onNameChange={handlePurposeNameChange}
        onNameBlur={handlePurposeNameBlur}
      />
    ),
  }));

  return (
    <div className={styles.root}>
      <RadioSelect
        playbookKey={`${playbookName}-instinct`}
        title="Instinct"
        options={instinctOptions}
        data={{ instinct, instinctCustom: '' } as CharacterData}
        onSave={handleInstinctSave}
        noCustom
        chooseNote="replaces playbook instinct"
      />

      <PlaybookSection title="Moves">
        <Text as="p" size="xs" color="muted" leading="normal">
          You gain all of the following:
        </Text>
        <div className={styles.moveList}>
          {moves.map((move) => (
            <Move key={move.id} move={move} />
          ))}
        </div>
      </PlaybookSection>

      <RadioSelect
        playbookKey={`${playbookName}-purpose`}
        title="Terrible Purpose"
        options={purposeOptions}
        data={{ instinct: purpose, instinctCustom: '' } as CharacterData}
        onSave={handlePurposeSave}
        noCustom
      />

      <PlaybookSection title="Consequences" chooseNote="choose 1 to start; more as play demands">
        <CheckboxGroup
          items={consequenceCheckboxItems}
          checked={consequences}
          onChange={handleConsequenceChange}
          itemGap={checkboxGroupItemGap}
        />
        {consequenceAddon?.({ consequences, saveImmediate, updateChecked })}
      </PlaybookSection>
    </div>
  );
};
