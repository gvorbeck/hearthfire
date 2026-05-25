import { useState, useRef, useEffect, useCallback, useId } from 'react';
import { Button, Heading, Text, RuleDivider, Tooltip, useToast } from '@/components/primitives';
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
  const { addToast } = useToast();
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState('');
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

  const startEditing = useCallback(() => {
    setValue(title);
    setEditing(true);
  }, [title]);

  const commit = useCallback(async () => {
    const trimmed = value.trim();
    try {
      if (trimmed && trimmed !== title) await onSaveTitle(trimmed);
    } catch {
      addToast('Failed to save game name. Try again.');
    } finally {
      setEditing(false);
    }
  }, [value, title, onSaveTitle, addToast]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => setValue(e.target.value), []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') commit();
    if (e.key === 'Escape') setEditing(false);
  }, [commit]);

  const copyGameId = useCallback(() => {
    navigator.clipboard.writeText(gameId).then(() => {
      setCopied(true);
      if (copiedTimerRef.current) clearTimeout(copiedTimerRef.current);
      copiedTimerRef.current = setTimeout(() => setCopied(false), 2000);
    }).catch(() => addToast('Failed to copy game ID.'));
  }, [gameId, addToast]);

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
              <Button
                variant="ghost"
                icon="pencil"
                size="sm"
                className={styles.editBtn}
                onClick={startEditing}
                aria-label={titleLabel}
                aria-describedby={editTooltipId}
              />
            </Tooltip>
          </>
        )}
      </div>
      {subtitle && <Text color="muted" size="sm" className={styles.subtitle}>{subtitle}</Text>}
      <div className={styles.gameId}>
        <Text color="muted" size="sm">
          Game ID: <Text as="span" color="accent" size="sm">{gameId}</Text>
        </Text>
        <Tooltip text={copyLabel} side="top" noTabStop tooltipId={copyTooltipId}>
          <Button
            variant="ghost"
            icon={copied ? 'check' : 'copy'}
            size="sm"
            className={styles.copyBtn}
            onClick={copyGameId}
            aria-label={copyLabel}
            aria-describedby={copyTooltipId}
          />
        </Tooltip>
      </div>
      <RuleDivider className={styles.rule} />
    </div>
  );
};
