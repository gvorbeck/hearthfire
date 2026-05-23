import { Input, Radio, Text } from '@/components/primitives';
import { PlaybookSection } from '../../PlaybookSection';
import { parseInlineMarkdown } from '@/lib/parseMarkdown';
import { INSERT_INSTINCT_OPTIONS, INSERT_PURPOSE_OPTIONS } from '@/lib/insertSharedData';
import styles from './InsertSections.module.css';

interface InsertInstinctSectionProps {
  radioName: string;
  instinct: string;
  instinctCollapsed: boolean;
  onToggleCollapse: () => void;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const InsertInstinctSection = ({
  radioName, instinct, instinctCollapsed, onToggleCollapse, onChange,
}: InsertInstinctSectionProps) => {
  const visible = instinctCollapsed && instinct
    ? INSERT_INSTINCT_OPTIONS.filter((o) => o.value === instinct)
    : INSERT_INSTINCT_OPTIONS;

  return (
    <PlaybookSection
      title="Instinct"
      choose={1}
      chooseNote="replaces playbook instinct"
      warn={!instinct}
      collapsible={!!instinct}
      isCollapsed={instinctCollapsed}
      onToggleCollapse={onToggleCollapse}
    >
      <div className={styles.radioList}>
        {visible.map((opt) => (
          <Radio
            key={opt.value}
            className={styles.radioRow}
            name={radioName}
            value={opt.value}
            checked={instinct === opt.value}
            onChange={onChange}
            label={
              <span className={styles.optionLabel}>
                <strong className={styles.optionTitle}>{opt.label}</strong>
                <span className={styles.optionDesc}>{opt.description}</span>
              </span>
            }
          />
        ))}
      </div>
    </PlaybookSection>
  );
};

interface InsertPurposeSectionProps {
  radioName: string;
  purpose: string;
  purposeNames: Record<string, string>;
  purposeCollapsed: boolean;
  onToggleCollapse: () => void;
  onPurposeChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onNameChange: (purposeValue: string, e: React.ChangeEvent<HTMLInputElement>) => void;
  onNameBlur: () => void;
}

export const InsertPurposeSection = ({
  radioName, purpose, purposeNames, purposeCollapsed, onToggleCollapse,
  onPurposeChange, onNameChange, onNameBlur,
}: InsertPurposeSectionProps) => {
  const visible = purposeCollapsed && purpose
    ? INSERT_PURPOSE_OPTIONS.filter((p) => p.value === purpose)
    : INSERT_PURPOSE_OPTIONS;

  return (
    <PlaybookSection
      title="Terrible Purpose"
      choose={1}
      warn={!purpose}
      collapsible={!!purpose}
      isCollapsed={purposeCollapsed}
      onToggleCollapse={onToggleCollapse}
    >
      <div className={styles.purposeList}>
        {visible.map((opt) => {
          const isSelected = purpose === opt.value;
          return (
            <div key={opt.value} className={styles.purposeEntry}>
              <Radio
                className={styles.radioRow}
                name={radioName}
                value={opt.value}
                checked={isSelected}
                onChange={onPurposeChange}
                label={<strong className={styles.optionTitle}>{opt.label}</strong>}
              />
              {isSelected && (
                <div className={styles.purposeDetail}>
                  <Input
                    className={styles.purposeNameInput}
                    type="text"
                    value={purposeNames[opt.value] ?? ''}
                    placeholder={opt.namePlaceholder}
                    aria-label={opt.namePrompt}
                    onChange={onNameChange.bind(null, opt.value)}
                    onBlur={onNameBlur}
                  />
                  <ul className={styles.triggerList}>
                    {opt.triggers.map((t) => (
                      <li key={t} className={styles.triggerItem}>
                        <Text as="span" size="sm" color="muted">{parseInlineMarkdown(t)}</Text>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </PlaybookSection>
  );
};
