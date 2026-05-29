import { useState, useRef, useEffect, useCallback, useId } from 'react';
import { Button, Heading, Text, RuleDivider, Tooltip, useToast } from '@/components/primitives';
import { Breadcrumb } from '@/components/Breadcrumb/Breadcrumb';
import type { Crumb } from '@/components/Breadcrumb/Breadcrumb';
import styles from './PageHeader.module.css';

type Props =
  | {
      crumbs: Crumb[];
      title: string;
      subtitle?: string;
      icon?: React.ReactElement<SVGSVGElement>;
      gameId: string;
      onSaveTitle: (value: string) => Promise<void>;
      titleLabel: string;
    }
  | {
      crumbs: Crumb[];
      title: string;
      subtitle?: string;
      icon?: React.ReactElement<SVGSVGElement>;
      gameId: string;
      onSaveTitle?: never;
      titleLabel?: never;
    };

export const PageHeader = ({ crumbs, title, titleLabel, subtitle, icon, gameId, onSaveTitle }: Props) => {
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
      if (trimmed && trimmed !== title) await onSaveTitle?.(trimmed);
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
        {icon && <span className={styles.titleIcon} aria-hidden="true">{icon}</span>}
        {onSaveTitle && editing ? (
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
            {onSaveTitle && (
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
            )}
          </>
        )}
      </div>
      {subtitle && <Text color="muted" size="xs" className={styles.subtitle}>{subtitle}</Text>}
      <div className={styles.gameId}>
        <Text color="muted" size="xs">
          Game ID: <Text as="span" color="accent" size="xs">{gameId}</Text>
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
