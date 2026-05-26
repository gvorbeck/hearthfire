import { useState, useCallback, useRef, useEffect, memo, useId } from 'react';
import clsx from 'clsx';
import { Button, Checkbox, Heading, Input, Modal, Text, Tooltip, UseDots, useToast } from '@/components/primitives';
import { PlaybookSection } from '../../PlaybookSection';
import { resolvePlaybookFeatures } from '@/lib/resolvePlaybookFeatures';
import { useCrewSave } from '../shared/useCrewSave';
import type { CharacterData, FollowerData, FollowerGearItem } from '@/types';
import styles from './FollowersInsert.module.css';

const GEAR_SINGLE_COUNT = 3;
const GEAR_DOUBLE_COUNT = 3;
const MOVES_COUNT = 3;
const LOYALTY_MAX = 3;

const emptyGear = (): FollowerGearItem[] => [
  ...Array.from({ length: GEAR_SINGLE_COUNT }, () => ({ checked: false, text: '', weight: 1 as const })),
  ...Array.from({ length: GEAR_DOUBLE_COUNT }, () => ({ checked: false, text: '', weight: 2 as const })),
];

const normalizeFollower = (raw: Partial<FollowerData> | undefined, id: string): FollowerData => ({
  id,
  name: raw?.name ?? '',
  tags: raw?.tags ?? '',
  hp: raw?.hp ?? '',
  maxHp: raw?.maxHp ?? '',
  armor: raw?.armor ?? '',
  damage: raw?.damage ?? '',
  exceptional: raw?.exceptional ?? false,
  group: raw?.group ?? false,
  instinct: raw?.instinct ?? '',
  moves: Array.from({ length: MOVES_COUNT }, (_, i) => raw?.moves?.[i] ?? ''),
  cost: raw?.cost ?? '',
  loyalty: raw?.loyalty ?? 0,
  gear: Array.from({ length: GEAR_SINGLE_COUNT + GEAR_DOUBLE_COUNT }, (_, i) => raw?.gear?.[i] ?? emptyGear()[i]),
  notes: raw?.notes ?? '',
});

const generateId = () => `follower-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

interface GearRowProps {
  followerIndex: number;
  gearIndex: number;
  weight: 1 | 2;
  checked: boolean;
  text: string;
  onCheckedChange: (fi: number, gi: number, checked: boolean) => void;
  onTextChange: (fi: number, gi: number, text: string) => void;
  onBlur: () => void;
}

const GearRow = memo(({ followerIndex, gearIndex, weight, checked, text, onCheckedChange, onTextChange, onBlur }: GearRowProps) => {
  const handleChecked = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => onCheckedChange(followerIndex, gearIndex, e.target.checked),
    [followerIndex, gearIndex, onCheckedChange],
  );
  const handleText = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => onTextChange(followerIndex, gearIndex, e.target.value),
    [followerIndex, gearIndex, onTextChange],
  );
  const label = weight === 2 ? 'double-weight gear item' : 'gear item';
  return (
    <div className={styles.gearRow}>
      <Checkbox
        variant="provision"
        weight={weight}
        checked={checked}
        onChange={handleChecked}
        aria-label={`Follower ${followerIndex + 1} ${label} ${gearIndex + 1} equipped`}
      />
      <Input
        className={styles.gearInput}
        type="text"
        value={text}
        placeholder="Item…"
        aria-label={`Follower ${followerIndex + 1} ${label} ${gearIndex + 1} name`}
        onChange={handleText}
        onBlur={onBlur}
      />
    </div>
  );
});

interface MoveRowProps {
  followerIndex: number;
  moveIndex: number;
  value: string;
  onChange: (fi: number, mi: number, val: string) => void;
  onBlur: () => void;
}

const MoveRow = memo(({ followerIndex, moveIndex, value, onChange, onBlur }: MoveRowProps) => {
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => onChange(followerIndex, moveIndex, e.target.value),
    [followerIndex, moveIndex, onChange],
  );
  return (
    <Input
      className={styles.moveInput}
      type="text"
      value={value}
      placeholder={`Move ${moveIndex + 1}…`}
      aria-label={`Follower ${followerIndex + 1} move ${moveIndex + 1}`}
      onChange={handleChange}
      onBlur={onBlur}
    />
  );
});

interface FollowerCardProps {
  follower: FollowerData;
  index: number;
  onFieldChange: (fi: number, field: keyof FollowerData, val: unknown) => void;
  onBlur: () => void;
  onGearCheckedChange: (fi: number, gi: number, checked: boolean) => void;
  onGearTextChange: (fi: number, gi: number, text: string) => void;
  onMoveChange: (fi: number, mi: number, val: string) => void;
  onLoyaltyChange: (fi: number, n: number) => void;
  onRemove: (id: string) => void;
}

const FollowerCard = memo(({
  follower, index,
  onFieldChange, onBlur,
  onGearCheckedChange, onGearTextChange,
  onMoveChange, onLoyaltyChange, onRemove,
}: FollowerCardProps) => {
  const headingId = useId();
  const removeTipId = useId();
  const confirmHeadingId = useId();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleName = useCallback((e: React.ChangeEvent<HTMLInputElement>) => onFieldChange(index, 'name', e.target.value), [index, onFieldChange]);
  const handleTags = useCallback((e: React.ChangeEvent<HTMLInputElement>) => onFieldChange(index, 'tags', e.target.value), [index, onFieldChange]);
  const handleHp = useCallback((e: React.ChangeEvent<HTMLInputElement>) => onFieldChange(index, 'hp', e.target.value), [index, onFieldChange]);
  const handleMaxHp = useCallback((e: React.ChangeEvent<HTMLInputElement>) => onFieldChange(index, 'maxHp', e.target.value), [index, onFieldChange]);
  const handleArmor = useCallback((e: React.ChangeEvent<HTMLInputElement>) => onFieldChange(index, 'armor', e.target.value), [index, onFieldChange]);
  const handleDamage = useCallback((e: React.ChangeEvent<HTMLInputElement>) => onFieldChange(index, 'damage', e.target.value), [index, onFieldChange]);
  const handleExceptional = useCallback((e: React.ChangeEvent<HTMLInputElement>) => onFieldChange(index, 'exceptional', e.target.checked), [index, onFieldChange]);
  const handleGroup = useCallback((e: React.ChangeEvent<HTMLInputElement>) => onFieldChange(index, 'group', e.target.checked), [index, onFieldChange]);
  const handleInstinct = useCallback((e: React.ChangeEvent<HTMLInputElement>) => onFieldChange(index, 'instinct', e.target.value), [index, onFieldChange]);
  const handleCost = useCallback((e: React.ChangeEvent<HTMLInputElement>) => onFieldChange(index, 'cost', e.target.value), [index, onFieldChange]);
  const handleNotes = useCallback((e: React.ChangeEvent<HTMLInputElement>) => onFieldChange(index, 'notes', e.target.value), [index, onFieldChange]);
  const handleBlur = onBlur;
  const handleLoyalty = useCallback((n: number) => onLoyaltyChange(index, n), [index, onLoyaltyChange]);
  const handleWheel = useCallback((e: React.WheelEvent<HTMLInputElement>) => e.currentTarget.blur(), []);

  const handleRequestRemove = useCallback(() => setConfirmOpen(true), []);
  const handleCancelRemove = useCallback(() => setConfirmOpen(false), []);
  const handleConfirmRemove = useCallback(() => {
    setConfirmOpen(false);
    onRemove(follower.id);
  }, [follower.id, onRemove]);

  const singleGear = follower.gear?.slice(0, GEAR_SINGLE_COUNT) ?? [];
  const doubleGear = follower.gear?.slice(GEAR_SINGLE_COUNT) ?? [];

  const followerLabel = follower.name || `Follower ${index + 1}`;

  return (
    <section className={styles.card} aria-labelledby={headingId}>
      <Heading as="h3" id={headingId} className={styles.srOnly}>{followerLabel}</Heading>
      <div className={styles.cardHeader}>
        <div className={styles.nameTagRow}>
          <Input
            className={styles.nameInput}
            type="text"
            value={follower.name ?? ''}
            placeholder="Name"
            aria-label={`Follower ${index + 1} name`}
            onChange={handleName}
            onBlur={handleBlur}
          />
          <Input
            className={styles.tagInput}
            type="text"
            value={follower.tags ?? ''}
            placeholder="Tags"
            aria-label={`Follower ${index + 1} tags`}
            onChange={handleTags}
            onBlur={handleBlur}
          />
        </div>
        <Tooltip text="Remove follower" side="left" noTabStop tooltipId={removeTipId}>
          <Button
            variant="ghost"
            size="sm"
            icon="close"
            onClick={handleRequestRemove}
            aria-label={`Remove ${followerLabel}`}
            aria-describedby={removeTipId}
          />
        </Tooltip>
      </div>

      <Modal open={confirmOpen} onClose={handleCancelRemove} aria-labelledby={confirmHeadingId}>
        <Heading as="h2" size="sm" id={confirmHeadingId}>Remove follower?</Heading>
        <Text size="sm" color="muted">
          <strong>{followerLabel}</strong> will be permanently removed. All follower data will be lost and cannot be recovered.
        </Text>
        <div className={styles.confirmActions}>
          <Button variant="ghost" size="md" onClick={handleCancelRemove}>Cancel</Button>
          <Button variant="primary" size="md" className={styles.removeBtn} onClick={handleConfirmRemove}>Remove follower</Button>
        </div>
      </Modal>

      <div className={styles.flags}>
        <Checkbox
          checked={follower.exceptional ?? false}
          onChange={handleExceptional}
          label={<Text as="span" size="sm" color="muted" className={styles.flagLabel}>exceptional</Text>}
        />
        <Checkbox
          checked={follower.group ?? false}
          onChange={handleGroup}
          label={<Text as="span" size="sm" color="muted" className={styles.flagLabel}>group</Text>}
        />
      </div>

      <div className={styles.statsRow}>
        <div className={styles.statBox}>
          <Input
            className={styles.statInput}
            type="number"
            value={follower.hp ?? ''}
            min={0}
            aria-label={`Follower ${index + 1} current HP`}
            onChange={handleHp}
            onBlur={handleBlur}
            onWheel={handleWheel}
          />
          <span className={styles.statLabel}>
            <Text as="span" size="sm" color="muted">HP</Text>
            <span className={styles.statMaxRow}>
              <Text as="span" size="sm" color="muted" className={styles.statNote}>Max</Text>
              <Input
                className={styles.maxHpInput}
                type="number"
                value={follower.maxHp ?? ''}
                min={0}
                aria-label={`Follower ${index + 1} max HP`}
                onChange={handleMaxHp}
                onBlur={handleBlur}
                onWheel={handleWheel}
              />
            </span>
          </span>
        </div>
        <div className={styles.statBox}>
          <Input
            className={styles.statInput}
            type="text"
            value={follower.armor ?? ''}
            aria-label={`Follower ${index + 1} armor`}
            onChange={handleArmor}
            onBlur={handleBlur}
          />
          <Text as="span" size="sm" color="muted" className={styles.statLabel}>Armor</Text>
        </div>
        <div className={styles.statBox}>
          <Input
            className={styles.statInput}
            type="text"
            value={follower.damage ?? ''}
            aria-label={`Follower ${index + 1} damage`}
            onChange={handleDamage}
            onBlur={handleBlur}
          />
          <Text as="span" size="sm" color="muted" className={styles.statLabel}>Damage</Text>
        </div>
      </div>

      <div className={styles.fieldRow}>
        <Text as="span" size="sm" color="muted" className={styles.fieldLabel}>Instinct</Text>
        <Input
          className={styles.fieldInput}
          type="text"
          value={follower.instinct ?? ''}
          placeholder="What trouble do they cause…"
          aria-label={`Follower ${index + 1} instinct`}
          onChange={handleInstinct}
          onBlur={handleBlur}
        />
      </div>

      <div className={styles.movesSection}>
        <Text as="span" size="sm" color="muted" className={styles.fieldLabel}>Moves</Text>
        <div className={styles.movesList}>
          {(follower.moves ?? []).map((mv, mi) => (
            <MoveRow
              key={`move-${follower.id}-${mi}`}
              followerIndex={index}
              moveIndex={mi}
              value={mv}
              onChange={onMoveChange}
              onBlur={onBlur}
            />
          ))}
        </div>
      </div>

      <div className={styles.costLoyaltyRow}>
        <div className={styles.fieldRow}>
          <Text as="span" size="sm" color="muted" className={styles.fieldLabel}>Cost</Text>
          <Input
            className={styles.fieldInput}
            type="text"
            value={follower.cost ?? ''}
            placeholder="What keeps them following…"
            aria-label={`Follower ${index + 1} cost`}
            onChange={handleCost}
            onBlur={handleBlur}
          />
        </div>
        <div className={styles.loyaltyRow}>
          <Text as="span" size="sm" color="muted" className={clsx(styles.fieldLabel, styles.loyaltyLabel)}>Loyalty</Text>
          <UseDots total={LOYALTY_MAX} checked={follower.loyalty ?? 0} onChange={handleLoyalty} />
        </div>
      </div>

      <div className={styles.gearSection}>
        <Text as="span" size="sm" color="muted" className={styles.fieldLabel}>Gear</Text>
        <div className={styles.gearColumns}>
          <div className={styles.gearCol}>
            {singleGear.map((item, gi) => (
              <GearRow
                key={`gear-single-${follower.id}-${gi}`}
                followerIndex={index}
                gearIndex={gi}
                weight={1}
                checked={item.checked}
                text={item.text}
                onCheckedChange={onGearCheckedChange}
                onTextChange={onGearTextChange}
                onBlur={onBlur}
              />
            ))}
          </div>
          <div className={styles.gearCol}>
            {doubleGear.map((item, gi) => (
              <GearRow
                key={`gear-double-${follower.id}-${gi}`}
                followerIndex={index}
                gearIndex={GEAR_SINGLE_COUNT + gi}
                weight={2}
                checked={item.checked}
                text={item.text}
                onCheckedChange={onGearCheckedChange}
                onTextChange={onGearTextChange}
                onBlur={onBlur}
              />
            ))}
          </div>
        </div>
      </div>

      <div className={styles.fieldRow}>
        <Text as="span" size="sm" color="muted" className={styles.fieldLabel}>Notes</Text>
        <Input
          className={styles.fieldInput}
          type="text"
          value={follower.notes ?? ''}
          placeholder="Notes…"
          aria-label={`Follower ${index + 1} notes`}
          onChange={handleNotes}
          onBlur={handleBlur}
        />
      </div>
    </section>
  );
});

interface FollowersInsertProps {
  data: CharacterData | undefined;
  onSave: (data: Partial<CharacterData>) => Promise<void>;
}

export const FollowersInsert = ({ data, onSave }: FollowersInsertProps) => {
  const { addToast } = useToast();
  const features = resolvePlaybookFeatures(data);

  const [followers, setFollowers] = useState<FollowerData[]>(() =>
    (features.followers ?? []).map((f) => normalizeFollower(f, f.id ?? generateId())),
  );

  const followersRef = useRef(followers);
  followersRef.current = followers;

  // Track the last Firestore snapshot we applied so we only sync when it
  // actually changes, not on every local keystroke that triggers a re-render.
  const lastFirestoreFollowersRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    const f = resolvePlaybookFeatures(data);
    if (f.followers === undefined) return;
    const incoming = JSON.stringify(f.followers);
    if (incoming === lastFirestoreFollowersRef.current) return;
    lastFirestoreFollowersRef.current = incoming;
    setFollowers(f.followers.map((fl) => normalizeFollower(fl, fl.id ?? generateId())));
  }, [data]);

  const { saveDebounced, saveImmediate, flushDebounce } = useCrewSave(data, onSave);

  const saveFollowers = useCallback((next: FollowerData[], prev?: FollowerData[]) => {
    saveImmediate({ followers: next }).catch(() => {
      if (prev) setFollowers(prev);
      addToast('Failed to save.');
    });
  }, [saveImmediate, addToast]);

  const saveFollowersDebounced = useCallback((next: FollowerData[]) => {
    saveDebounced({ followers: next }, () => addToast('Failed to save.'));
  }, [saveDebounced, addToast]);

  const flushFollowers = useCallback(() => {
    flushDebounce({ followers: followersRef.current }).catch(() => addToast('Failed to save.'));
  }, [flushDebounce, addToast]);

  const handleAdd = useCallback(() => {
    const prev = followersRef.current;
    const next = [...prev, normalizeFollower(undefined, generateId())];
    setFollowers(next);
    saveFollowers(next, prev);
  }, [saveFollowers]);

  const handleRemove = useCallback((id: string) => {
    const prev = followersRef.current;
    const next = prev.filter((f) => f.id !== id);
    setFollowers(next);
    saveFollowers(next, prev);
  }, [saveFollowers]);

  const handleFieldChange = useCallback((fi: number, field: keyof FollowerData, val: unknown) => {
    const prev = followersRef.current;
    const next = prev.map((f, i) => i === fi ? { ...f, [field]: val } : f);
    setFollowers(next);
    if (field === 'exceptional' || field === 'group' || field === 'loyalty') {
      saveFollowers(next, prev);
    } else {
      saveFollowersDebounced(next);
    }
  }, [saveFollowers, saveFollowersDebounced]);

  const handleBlur = useCallback(() => {
    flushFollowers();
  }, [flushFollowers]);

  const handleGearCheckedChange = useCallback((fi: number, gi: number, checked: boolean) => {
    const prev = followersRef.current;
    const next = prev.map((f, i) => {
      if (i !== fi) return f;
      const gear = [...(f.gear ?? emptyGear())];
      gear[gi] = { ...gear[gi], checked };
      return { ...f, gear };
    });
    setFollowers(next);
    saveFollowers(next, prev);
  }, [saveFollowers]);

  const handleGearTextChange = useCallback((fi: number, gi: number, text: string) => {
    const prev = followersRef.current;
    const next = prev.map((f, i) => {
      if (i !== fi) return f;
      const gear = [...(f.gear ?? emptyGear())];
      gear[gi] = { ...gear[gi], text };
      return { ...f, gear };
    });
    setFollowers(next);
    saveFollowersDebounced(next);
  }, [saveFollowersDebounced]);

  const handleMoveChange = useCallback((fi: number, mi: number, val: string) => {
    const prev = followersRef.current;
    const next = prev.map((f, i) => {
      if (i !== fi) return f;
      const moves = [...(f.moves ?? Array(MOVES_COUNT).fill(''))];
      moves[mi] = val;
      return { ...f, moves };
    });
    setFollowers(next);
    saveFollowersDebounced(next);
  }, [saveFollowersDebounced]);

  const handleLoyaltyChange = useCallback((fi: number, n: number) => {
    const prev = followersRef.current;
    const next = prev.map((f, i) => i === fi ? { ...f, loyalty: n } : f);
    setFollowers(next);
    saveFollowers(next, prev);
  }, [saveFollowers]);

  return (
    <div className={styles.root}>
      <PlaybookSection title="Followers">
        {followers.length === 0 && (
          <Text as="p" size="sm" color="muted" className={styles.empty}>No followers yet. Add one below.</Text>
        )}
        {followers.map((follower, index) => (
          <FollowerCard
            key={follower.id}
            follower={follower}
            index={index}
            onFieldChange={handleFieldChange}
            onBlur={handleBlur}
            onGearCheckedChange={handleGearCheckedChange}
            onGearTextChange={handleGearTextChange}
            onMoveChange={handleMoveChange}
            onLoyaltyChange={handleLoyaltyChange}
            onRemove={handleRemove}
          />
        ))}
        <Button variant="secondary" onClick={handleAdd}>Add Follower</Button>
      </PlaybookSection>
    </div>
  );
};
