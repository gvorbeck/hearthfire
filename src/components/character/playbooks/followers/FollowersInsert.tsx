import { useState, useCallback, useRef, useEffect, memo, useId } from "react";
import { useLatest } from "@/hooks/useLatest";
import clsx from "clsx";
import {
  Button,
  Checkbox,
  Heading,
  Input,
  Modal,
  Text,
  Tooltip,
} from "@/components/ui";

import { useToast } from "@/components/app";
import { PlaybookSection } from '@/components/playbook/PlaybookSection';
import { resolvePlaybookFeatures } from "@/lib/resolvePlaybookFeatures";
import { generateId } from "@/lib/id";
import { useCrewSave } from "../shared/useCrewSave";
import { StatBox, LoyaltyRow, CustomItemsGrid } from "../shared/CrewWidgets";
import type { FollowerData, FollowerGearItem, PlaybookSectionProps } from "@/types";
import styles from "./FollowersInsert.module.css";

const GEAR_SINGLE_COUNT = 3;
const GEAR_DOUBLE_COUNT = 3;
const MOVES_COUNT = 3;

const emptyGear = (): FollowerGearItem[] => [
  ...Array.from({ length: GEAR_SINGLE_COUNT }, () => ({
    checked: false,
    text: "",
    weight: 1 as const,
  })),
  ...Array.from({ length: GEAR_DOUBLE_COUNT }, () => ({
    checked: false,
    text: "",
    weight: 2 as const,
  })),
];

const normalizeFollower = (
  raw: Partial<FollowerData> | undefined,
  id: string,
): FollowerData => ({
  id,
  name: raw?.name ?? "",
  tags: raw?.tags ?? "",
  hp: raw?.hp ?? "",
  maxHp: raw?.maxHp ?? "",
  armor: raw?.armor ?? "",
  damage: raw?.damage ?? "",
  exceptional: raw?.exceptional ?? false,
  group: raw?.group ?? false,
  instinct: raw?.instinct ?? "",
  moves: Array.from({ length: MOVES_COUNT }, (_, i) => raw?.moves?.[i] ?? ""),
  cost: raw?.cost ?? "",
  loyalty: raw?.loyalty ?? 0,
  gear: Array.from(
    { length: GEAR_SINGLE_COUNT + GEAR_DOUBLE_COUNT },
    (_, i) => raw?.gear?.[i] ?? emptyGear()[i],
  ),
  notes: raw?.notes ?? "",
});

interface MoveRowProps {
  followerIndex: number;
  moveIndex: number;
  value: string;
  onChange: (fi: number, mi: number, val: string) => void;
  onBlur: () => void;
}

const MoveRow = memo(
  ({ followerIndex, moveIndex, value, onChange, onBlur }: MoveRowProps) => {
    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) =>
        onChange(followerIndex, moveIndex, e.target.value),
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
  },
);

interface FollowerCardProps {
  follower: FollowerData;
  index: number;
  onFieldChange: <K extends keyof FollowerData>(fi: number, field: K, val: FollowerData[K]) => void;
  onBlur: () => void;
  onGearCheckedChange: (fi: number, gi: number, checked: boolean) => void;
  onGearTextChange: (fi: number, gi: number, text: string) => void;
  onMoveChange: (fi: number, mi: number, val: string) => void;
  onLoyaltyChange: (fi: number, n: number) => void;
  onRemove: (id: string) => void;
}

const FollowerCard = memo(
  ({
    follower,
    index,
    onFieldChange,
    onBlur,
    onGearCheckedChange,
    onGearTextChange,
    onMoveChange,
    onLoyaltyChange,
    onRemove,
  }: FollowerCardProps) => {
    const headingId = useId();
    const removeTipId = useId();
    const confirmHeadingId = useId();
    const [confirmOpen, setConfirmOpen] = useState(false);

    const handleName = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) =>
        onFieldChange(index, "name", e.target.value),
      [index, onFieldChange],
    );
    const handleTags = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) =>
        onFieldChange(index, "tags", e.target.value),
      [index, onFieldChange],
    );
    const handleHp = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) =>
        onFieldChange(index, "hp", e.target.value),
      [index, onFieldChange],
    );
    const handleMaxHp = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) =>
        onFieldChange(index, "maxHp", e.target.value),
      [index, onFieldChange],
    );
    const handleArmor = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) =>
        onFieldChange(index, "armor", e.target.value),
      [index, onFieldChange],
    );
    const handleDamage = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) =>
        onFieldChange(index, "damage", e.target.value),
      [index, onFieldChange],
    );
    const handleExceptional = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) =>
        onFieldChange(index, "exceptional", e.target.checked),
      [index, onFieldChange],
    );
    const handleGroup = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) =>
        onFieldChange(index, "group", e.target.checked),
      [index, onFieldChange],
    );
    const handleInstinct = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) =>
        onFieldChange(index, "instinct", e.target.value),
      [index, onFieldChange],
    );
    const handleCost = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) =>
        onFieldChange(index, "cost", e.target.value),
      [index, onFieldChange],
    );
    const handleNotes = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) =>
        onFieldChange(index, "notes", e.target.value),
      [index, onFieldChange],
    );
    const handleLoyalty = useCallback(
      (n: number) => onLoyaltyChange(index, n),
      [index, onLoyaltyChange],
    );
    const handleGearChecked = useCallback(
      (flatIndex: number, checked: boolean) => onGearCheckedChange(index, flatIndex, checked),
      [index, onGearCheckedChange],
    );
    const handleGearText = useCallback(
      (flatIndex: number, text: string) => onGearTextChange(index, flatIndex, text),
      [index, onGearTextChange],
    );
    const handleWheel = useCallback(
      (e: React.WheelEvent<HTMLInputElement>) => e.currentTarget.blur(),
      [],
    );

    const handleRequestRemove = useCallback(() => setConfirmOpen(true), []);
    const handleCancelRemove = useCallback(() => setConfirmOpen(false), []);
    const handleConfirmRemove = useCallback(() => {
      setConfirmOpen(false);
      onRemove(follower.id);
    }, [follower.id, onRemove]);

    const singleGear = follower.gear?.slice(0, GEAR_SINGLE_COUNT) ?? [];
    const doubleGear = follower.gear?.slice(GEAR_SINGLE_COUNT) ?? [];

    const followerLabel = follower.name || `Follower ${index + 1}`;
    const loyaltyLabelCx = clsx(styles.fieldLabel, styles.loyaltyLabel);

    return (
      <section className={styles.card} aria-labelledby={headingId}>
        <Heading as="h3" id={headingId} className={styles.srOnly}>
          {followerLabel}
        </Heading>
        <div className={styles.cardHeader}>
          <div className={styles.nameTagRow}>
            <Input
              className={styles.nameInput}
              type="text"
              value={follower.name ?? ""}
              placeholder="Name"
              aria-label={`Follower ${index + 1} name`}
              onChange={handleName}
              onBlur={onBlur}
            />
            <Input
              className={styles.tagInput}
              type="text"
              value={follower.tags ?? ""}
              placeholder="Tags"
              aria-label={`Follower ${index + 1} tags`}
              onChange={handleTags}
              onBlur={onBlur}
            />
          </div>
          <Tooltip
            text="Remove follower"
            side="left"
            noTabStop
            tooltipId={removeTipId}
          >
            <Button
              variant="ghost"
             
              icon="close"
              onClick={handleRequestRemove}
              aria-label={`Remove ${followerLabel}`}
              aria-describedby={removeTipId}
            />
          </Tooltip>
        </div>

        <Modal
          open={confirmOpen}
          onClose={handleCancelRemove}
          aria-labelledby={confirmHeadingId}
        >
          <Heading as="h2" id={confirmHeadingId}>
            Remove follower?
          </Heading>
          <Text size="xs" color="muted">{`**${followerLabel}** will be permanently removed. All follower data will be lost and cannot be recovered.`}</Text>
          <div className={styles.confirmActions}>
            <Button variant="ghost" size="md" onClick={handleCancelRemove}>
              Cancel
            </Button>
            <Button
              variant="danger"
              size="md"
              onClick={handleConfirmRemove}
            >
              Remove follower
            </Button>
          </div>
        </Modal>

        <div className={styles.flags}>
          <Checkbox
            checked={follower.exceptional ?? false}
            onChange={handleExceptional}
            label={
              <Text as="span" color="muted" font="serif" italic>
                exceptional
              </Text>
            }
          />
          <Checkbox
            checked={follower.group ?? false}
            onChange={handleGroup}
            label={
              <Text as="span" color="muted" font="serif" italic>
                group
              </Text>
            }
          />
        </div>

        <div className={styles.statsRow}>
          <StatBox
            compact
            ariaLabel={`Follower ${index + 1} current HP`}
            value={follower.hp ?? ""}
            inputType="number"
            inputProps={{ min: 0 }}
            onChange={handleHp}
            onBlur={onBlur}
            onWheel={handleWheel}
            label={
              <Text as="span" size="xs" color="muted">
                HP
              </Text>
            }
          >
            <Text as="span" className={styles.statMaxRow}>
              <Text as="span" size="xs" color="muted" italic className={styles.statNote}>
                Max
              </Text>
              <Input
                className={styles.maxHpInput}
                type="number"
                value={follower.maxHp ?? ""}
                min={0}
                aria-label={`Follower ${index + 1} max HP`}
                onChange={handleMaxHp}
                onBlur={onBlur}
                onWheel={handleWheel}
              />
            </Text>
          </StatBox>
          <StatBox
            compact
            ariaLabel={`Follower ${index + 1} armor`}
            value={follower.armor ?? ""}
            inputType="text"
            onChange={handleArmor}
            onBlur={onBlur}
            label={<Text as="span" size="xs" color="muted">Armor</Text>}
          />
          <StatBox
            compact
            ariaLabel={`Follower ${index + 1} damage`}
            value={follower.damage ?? ""}
            inputType="text"
            onChange={handleDamage}
            onBlur={onBlur}
            label={<Text as="span" size="xs" color="muted">Damage</Text>}
          />
        </div>

        <div className={styles.fieldRow}>
          <Text as="span" size="xs" color="muted" className={styles.fieldLabel}>
            Instinct
          </Text>
          <Input
            className={styles.fieldInput}
            type="text"
            value={follower.instinct ?? ""}
            placeholder="What trouble do they cause…"
            aria-label={`Follower ${index + 1} instinct`}
            onChange={handleInstinct}
            onBlur={onBlur}
          />
        </div>

        <div className={styles.movesSection}>
          <Text as="span" size="xs" color="muted" className={styles.fieldLabel}>
            Moves
          </Text>
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
            <Text
              as="span"
              size="xs"
              color="muted"
              className={styles.fieldLabel}
            >
              Cost
            </Text>
            <Input
              className={styles.fieldInput}
              type="text"
              value={follower.cost ?? ""}
              placeholder="What keeps them following…"
              aria-label={`Follower ${index + 1} cost`}
              onChange={handleCost}
              onBlur={onBlur}
            />
          </div>
          <LoyaltyRow
            value={follower.loyalty ?? 0}
            onChange={handleLoyalty}
            label={<Text as="span" size="xs" color="muted" className={loyaltyLabelCx}>Loyalty</Text>}
          />
        </div>

        <div className={styles.gearSection}>
          <Text as="span" size="xs" color="muted" className={styles.fieldLabel}>
            Gear
          </Text>
          <CustomItemsGrid
            singleItems={singleGear}
            doubleItems={doubleGear}
            doubleOffset={GEAR_SINGLE_COUNT}
            onCheckedChange={handleGearChecked}
            onTextChange={handleGearText}
            onBlur={onBlur}
            ariaPrefix={`Follower ${index + 1}`}
          />
        </div>

        <div className={styles.fieldRow}>
          <Text as="span" size="xs" color="muted" className={styles.fieldLabel}>
            Notes
          </Text>
          <Input
            className={styles.fieldInput}
            type="text"
            value={follower.notes ?? ""}
            placeholder="Notes…"
            aria-label={`Follower ${index + 1} notes`}
            onChange={handleNotes}
            onBlur={onBlur}
          />
        </div>
      </section>
    );
  },
);

type FollowersInsertProps = PlaybookSectionProps;

export const FollowersInsert = ({ data, onSave }: FollowersInsertProps) => {
  const { addToast } = useToast();
  const features = resolvePlaybookFeatures(data);

  const [followers, setFollowers] = useState<FollowerData[]>(() =>
    (features.followers ?? []).map((f) =>
      normalizeFollower(f, f.id ?? generateId()),
    ),
  );

  const followersRef = useLatest(followers);

  const { saveDebounced, saveImmediate, flushDebounce, pendingRef, resolvedTick } =
    useCrewSave(data, onSave);

  // Track the last Firestore snapshot we applied so we only sync when it
  // actually changes, not on every local keystroke that triggers a re-render.
  const lastFirestoreFollowersRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    const f = resolvePlaybookFeatures(data);
    if (f.followers === undefined) return;
    const incoming = JSON.stringify(f.followers);
    if (incoming === lastFirestoreFollowersRef.current) return;
    // While a save is in flight, skip applying the echo — it would clobber
    // optimistic local state mid-keystroke. resolvedTick forces this effect to
    // re-run against the latest `data` once the save resolves, so a remote
    // edit that arrived mid-save is still applied instead of being dropped.
    if (pendingRef.current) return;
    lastFirestoreFollowersRef.current = incoming;
    setFollowers(
      f.followers.map((fl) => normalizeFollower(fl, fl.id ?? generateId())),
    );
  }, [data, pendingRef, resolvedTick]);

  const saveFollowers = useCallback(
    (next: FollowerData[], prev?: FollowerData[]) => {
      saveImmediate({ followers: next }).catch(() => {
        if (prev) setFollowers(prev);
        addToast("Failed to save.", "error");
      });
    },
    [saveImmediate, addToast],
  );

  const saveFollowersDebounced = useCallback(
    (next: FollowerData[]) => {
      saveDebounced({ followers: next }, () =>
        addToast("Failed to save.", "error"),
      );
    },
    [saveDebounced, addToast],
  );

  const flushFollowers = useCallback(() => {
    flushDebounce({ followers: followersRef.current }).catch(() =>
      addToast("Failed to save.", "error"),
    );
  }, [flushDebounce, addToast]);

  const handleAdd = useCallback(() => {
    const prev = followersRef.current;
    const next = [...prev, normalizeFollower(undefined, generateId())];
    setFollowers(next);
    saveFollowers(next, prev);
  }, [saveFollowers]);

  const handleRemove = useCallback(
    (id: string) => {
      const prev = followersRef.current;
      const next = prev.filter((f) => f.id !== id);
      setFollowers(next);
      saveFollowers(next, prev);
    },
    [saveFollowers],
  );

  const handleFieldChange = useCallback(
    <K extends keyof FollowerData>(fi: number, field: K, val: FollowerData[K]) => {
      const prev = followersRef.current;
      const next = prev.map((f, i) => (i === fi ? { ...f, [field]: val } : f));
      setFollowers(next);
      if (field === "exceptional" || field === "group" || field === "loyalty") {
        saveFollowers(next, prev);
      } else {
        saveFollowersDebounced(next);
      }
    },
    [saveFollowers, saveFollowersDebounced],
  );

  const handleGearCheckedChange = useCallback(
    (fi: number, gi: number, checked: boolean) => {
      const prev = followersRef.current;
      const next = prev.map((f, i) => {
        if (i !== fi) return f;
        const gear = [...(f.gear ?? emptyGear())];
        gear[gi] = { ...gear[gi], checked };
        return { ...f, gear };
      });
      setFollowers(next);
      saveFollowers(next, prev);
    },
    [saveFollowers],
  );

  const handleGearTextChange = useCallback(
    (fi: number, gi: number, text: string) => {
      const prev = followersRef.current;
      const next = prev.map((f, i) => {
        if (i !== fi) return f;
        const gear = [...(f.gear ?? emptyGear())];
        gear[gi] = { ...gear[gi], text };
        return { ...f, gear };
      });
      setFollowers(next);
      saveFollowersDebounced(next);
    },
    [saveFollowersDebounced],
  );

  const handleMoveChange = useCallback(
    (fi: number, mi: number, val: string) => {
      const prev = followersRef.current;
      const next = prev.map((f, i) => {
        if (i !== fi) return f;
        const moves = [...(f.moves ?? Array(MOVES_COUNT).fill(""))];
        moves[mi] = val;
        return { ...f, moves };
      });
      setFollowers(next);
      saveFollowersDebounced(next);
    },
    [saveFollowersDebounced],
  );

  const handleLoyaltyChange = useCallback(
    (fi: number, n: number) => {
      const prev = followersRef.current;
      const next = prev.map((f, i) => (i === fi ? { ...f, loyalty: n } : f));
      setFollowers(next);
      saveFollowers(next, prev);
    },
    [saveFollowers],
  );

  return (
    <div className={styles.root}>
      <PlaybookSection title="Followers">
        {followers.length === 0 && (
          <Text
            size="xs"
            font="serif"
            color="muted"
            italic
            className={styles.empty}
          >
            No followers yet. Add one below.
          </Text>
        )}
        {followers.map((follower, index) => (
          <FollowerCard
            key={follower.id}
            follower={follower}
            index={index}
            onFieldChange={handleFieldChange}
            onBlur={flushFollowers}
            onGearCheckedChange={handleGearCheckedChange}
            onGearTextChange={handleGearTextChange}
            onMoveChange={handleMoveChange}
            onLoyaltyChange={handleLoyaltyChange}
            onRemove={handleRemove}
          />
        ))}
        <Button variant="secondary" onClick={handleAdd}>
          Add Follower
        </Button>
      </PlaybookSection>
    </div>
  );
};
