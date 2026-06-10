import { useState, useCallback, useId } from 'react';
import clsx from 'clsx';
import { useNavigate, useLocation } from 'react-router-dom';
import { PageMeta } from '@/components/app/PageMeta/PageMeta';
import { PageLayout } from '@/components/app/PageLayout/PageLayout';
import { createGame, createGameWithId } from '@/lib/game';
import { useGameIdCheck } from '@/hooks/useGameIdCheck';
import { Button, Heading, Icon, Input, RuleDivider, Stack, Text } from '@/components/ui';
import styles from './Home.module.css';

const STATUS_MESSAGES = {
  idle: '',
  checking: 'Checking availability…',
  available: 'Available',
  taken: 'Already taken — choose a different name.',
  invalid: 'Must be at least 3 characters.',
} as const;

export const Home = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const customIdHintId = useId();

  const [joinId, setJoinId] = useState('');
  const [joinError, setJoinError] = useState('');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');
  const [customIdRaw, setCustomIdRaw] = useState('');

  const { slug, status } = useGameIdCheck(customIdRaw);

  const handleCreate = useCallback(async (e?: React.FormEvent) => {
    e?.preventDefault();
    setCreating(true);
    setCreateError('');
    try {
      if (slug) {
        await createGameWithId(slug);
        navigate(`/game/${slug}`, { state: { isNew: true } });
      } else {
        const id = await createGame();
        navigate(`/game/${id}`, { state: { isNew: true } });
      }
    } catch (err) {
      const msg = err instanceof Error && err.message === 'Game ID already taken.'
        ? 'That name was just taken — choose another.'
        : 'Failed to create game. Please try again.';
      setCreateError(msg);
    } finally {
      setCreating(false);
    }
  }, [navigate, slug]);

  const handleCustomIdChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomIdRaw(e.target.value);
    setCreateError('');
  }, []);

  const handleJoin = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = joinId.trim();
    if (!trimmed) {
      setJoinError('Please enter a game ID.');
      return;
    }
    navigate(`/game/${trimmed}`);
  }, [joinId, navigate]);

  const handleJoinIdChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setJoinId(e.target.value);
    setJoinError('');
  }, []);

  const isCreateDisabled = creating || status === 'taken' || status === 'invalid' || status === 'checking';
  const showSlugPreview = status === 'available' || status === 'checking';

  const hintCx = clsx(
    styles.idHint,
    status === 'available' && styles.idHintAvailable,
    (status === 'taken' || status === 'invalid') && styles.idHintTaken,
    status === 'checking' && styles.idHintChecking,
  );

  return (
    <PageLayout simple>
      <PageMeta
        title="Hearthfire — Stonetop Party Tracker"
        description="Track your Stonetop TTRPG campaign — manage characters, GM playbook, and game sessions."
        url={`${window.location.origin}${location.pathname}`}
      />
      <div className={styles.page}>
      <div className={styles.hero}>
        <div className={styles.logoWrap}>
          <Icon logoIcon="stonetop" className={styles.logo} />
          <div className={styles.heroText}>
            <Text className={styles.eyebrow}>Party Tracker</Text>
            <Heading as="h1" size="xl" className={styles.wordmark}>Hearthfire</Heading>
          </div>
        </div>
        <RuleDivider className={styles.rule} />
        <Text className={styles.subtitle}>For the Stonetop TTRPG by Jeremy Strandberg</Text>
      </div>

      <div className={styles.cards}>
        <div className={styles.card}>
          <Heading as="h2" size="label">New Game</Heading>
          <form onSubmit={handleCreate} className={styles.cardBody}>
            <Text color="muted" size="xs">
              Start a new session. Leave the name blank for a generated ID, or choose one your group will remember.
            </Text>
            <Stack gap={2}>
              <Input
                id="custom-game-id"
                label="Custom game name (optional)"
                placeholder="e.g. tuesdays-at-the-hearth"
                value={customIdRaw}
                onChange={handleCustomIdChange}
                aria-describedby={status !== 'idle' ? customIdHintId : undefined}
                autoComplete="off"
                autoCapitalize="none"
                spellCheck={false}
              />
              <div id={customIdHintId} aria-live="polite" aria-atomic="true">
                {status !== 'idle' && (
                  <>
                    {showSlugPreview && (
                      <Text as="span" className={styles.idSlugPreview}>{`hearthfire.camp/game/**${slug}**`}</Text>
                    )}
                    <span className={hintCx}>{STATUS_MESSAGES[status]}</span>
                  </>
                )}
              </div>
            </Stack>
            <Button
              type="submit"
              disabled={isCreateDisabled}
              size="lg"
              fullWidth
            >
              {creating ? 'Creating…' : 'Create Game'}
            </Button>
            {createError && (
              <Text color="muted" size="xs" role="alert">{createError}</Text>
            )}
          </form>
        </div>

        <div className={styles.card}>
          <Heading as="h2" size="label">Join Game</Heading>
          <form onSubmit={handleJoin} className={styles.cardBody}>
            <Stack gap={4}>
              <Input
                id="join-id"
                label="Game ID"
                placeholder="Paste your ID"
                value={joinId}
                onChange={handleJoinIdChange}
                error={joinError}
              />
              <Button type="submit" variant="secondary" size="lg" fullWidth>
                Join
              </Button>
            </Stack>
          </form>
        </div>
      </div>
      </div>
    </PageLayout>
  );
};
