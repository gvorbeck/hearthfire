import { useState, useRef, useEffect, useId } from 'react';
import { Heading, Text, Icon, RuleDivider, Tooltip } from '@/components/primitives';
import { Breadcrumb } from '@/components/Breadcrumb/Breadcrumb';
import type { Crumb } from '@/components/Breadcrumb/Breadcrumb';
import styles from './PageHeader.module.css';

interface Props {
  crumbs: Crumb[];
  title: string;
  titleLabel: string;
  subtitle?: string;
  gameId: string;
  onSaveTitle: (value: string) => Promise<void>;
}

export const PageHeader = ({ crumbs, title, titleLabel, subtitle, gameId, onSaveTitle }: Props) => {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState('');
  const [saveError, setSaveError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const copiedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const editTooltipId = useId();
  const copyTooltipId = useId();

  useEffect(() => {
    if (editing) inputRef.current?.select();
  }, [editing]);

  useEffect(() => {
    return () => {
      if (copiedTimerRef.current) clearTimeout(copiedTimerRef.current);
    };
  }, []);

  const startEditing = () => {
    setValue(title);
    setSaveError(null);
    setEditing(true);
  };

  const commit = async () => {
    const trimmed = value.trim();
    try {
      if (trimmed && trimmed !== title) await onSaveTitle(trimmed);
      setEditing(false);
    } catch {
      setSaveError('Failed to save. Try again.');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => setValue(e.target.value);

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') await commit();
    if (e.key === 'Escape') setEditing(false);
  };

  const copyGameId = () => {
    navigator.clipboard.writeText(gameId).catch(() => {});
    setCopied(true);
    if (copiedTimerRef.current) clearTimeout(copiedTimerRef.current);
    copiedTimerRef.current = setTimeout(() => setCopied(false), 2000);
  };

  const copyLabel = copied ? 'Copied!' : 'Copy game ID';

  return (
    <div className={styles.header}>
      <Breadcrumb crumbs={crumbs} />
      <div className={styles.titleRow}>
        {editing ? (
          <input
            ref={inputRef}
            className={styles.titleInput}
            value={value}
            onChange={handleChange}
            onBlur={commit}
            onKeyDown={handleKeyDown}
            aria-label={titleLabel}
          />
        ) : (
          <>
            <Heading as="h1" size="xl">{title}</Heading>
            <Tooltip text="Edit name" side="top" noTabStop tooltipId={editTooltipId}>
              <button
                className={styles.editBtn}
                onClick={startEditing}
                aria-label={titleLabel}
                aria-describedby={editTooltipId}
              >
                <Icon name="pencil" size="small" aria-hidden />
              </button>
            </Tooltip>
          </>
        )}
      </div>
      {saveError && <Text color="muted" size="sm" className={styles.saveError}>{saveError}</Text>}
      {subtitle && <Text color="muted" size="sm" className={styles.subtitle}>{subtitle}</Text>}
      <div className={styles.gameId}>
        <Text color="muted" size="sm">
          Game ID: <Text as="span" color="accent" size="sm">{gameId}</Text>
        </Text>
        <Tooltip text={copyLabel} side="top" noTabStop tooltipId={copyTooltipId}>
          <button
            className={styles.copyBtn}
            onClick={copyGameId}
            aria-label={copyLabel}
            aria-describedby={copyTooltipId}
          >
            <Icon name={copied ? 'check' : 'copy'} size="small" aria-hidden />
          </button>
        </Tooltip>
      </div>
      <RuleDivider className={styles.rule} />
    </div>
  );
};
