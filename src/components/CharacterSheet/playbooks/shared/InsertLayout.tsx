import type { ReactNode } from 'react';
import { CheckboxGroup, Text } from '@/components/primitives';
import { PlaybookSection } from '../../PlaybookSection';
import { Move } from '../../Move';
import type { MoveDefinition } from '../../Move';
import { InsertInstinctSection, InsertPurposeSection } from './InsertSections';
import { useInsertSections } from './useInsertSections';
import { useConsequenceCheckboxes } from './useConsequenceCheckboxes';
import type { CharacterData, PlaybookFeatures } from '@/types';
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
  const {
    instinct, purpose, purposeNames,
    instinctCollapsed, purposeCollapsed,
    handleToggleInstinctCollapse, handleTogglePurposeCollapse,
    handleInstinctChange, handlePurposeChange,
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

  return (
    <div className={styles.root}>
      <InsertInstinctSection
        radioName={`${playbookName}-instinct`}
        instinct={instinct}
        instinctCollapsed={instinctCollapsed}
        onToggleCollapse={handleToggleInstinctCollapse}
        onChange={handleInstinctChange}
      />

      <PlaybookSection title="Moves">
        <Text as="p" size="sm" color="muted" className={styles.prose}>
          You gain all of the following:
        </Text>
        <div className={styles.moveList}>
          {moves.map((move) => (
            <Move key={move.id} move={move} />
          ))}
        </div>
      </PlaybookSection>

      <InsertPurposeSection
        radioName={`${playbookName}-purpose`}
        purpose={purpose}
        purposeNames={purposeNames}
        purposeCollapsed={purposeCollapsed}
        onToggleCollapse={handleTogglePurposeCollapse}
        onPurposeChange={handlePurposeChange}
        onNameChange={handlePurposeNameChange}
        onNameBlur={handlePurposeNameBlur}
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
