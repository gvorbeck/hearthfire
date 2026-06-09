import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { Button, Heading, Modal, Text } from '@/components/ui';
import styles from './GameIdModal.module.css';

interface GameIdModalProps {
  gameId: string;
  open: boolean;
  onClose: () => void;
}

export const GameIdModal = ({ gameId, open, onClose }: GameIdModalProps) => {
  const headingId = useId();
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (resetTimer.current !== null) clearTimeout(resetTimer.current);
    };
  }, []);

  useEffect(() => {
    if (open) {
      setCopied(false);
      setCopyError(false);
    }
  }, [open]);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(gameId);
      setCopied(true);
      setCopyError(false);
      resetTimer.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopyError(true);
    }
  }, [gameId]);

  return (
    <Modal open={open} onClose={onClose} aria-labelledby={headingId}>
      <Heading as="h2" size="md" id={headingId}>Your Game ID</Heading>

      <div className={styles.idRow}>
        <Text as="span" color="accent" className={styles.idText}>{gameId}</Text>
        <Button
          variant="ghost"
          size="sm"
          icon="copy"
          onClick={handleCopy}
          aria-label="Copy game ID"
          title={copied ? 'Copied!' : 'Copy game ID'}
        />
      </div>

      {copyError && (
        <Text size="xs" color="muted" role="alert">Could not copy — please copy the ID manually.</Text>
      )}

      <div className={styles.warning}>
        <Text size="xs" color="muted">
          <strong className={styles.warningLabel}>Save this ID somewhere safe.</strong>{' '}
          It's the only way to access this game. If you lose it, there's no way to recover it.
        </Text>
      </div>

      <Button type="button" onClick={onClose} size="md">Got it</Button>
    </Modal>
  );
};
