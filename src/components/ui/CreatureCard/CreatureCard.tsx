import { useCallback, memo, useId } from "react";
import clsx from "clsx";
import { Heading } from "../Heading/Heading";
import { Input } from "../Input/Input";
import { List } from "../List/List";
import { Text } from "../Text/Text";
import { UseDots } from "../UseDots/UseDots";
import type { Creature } from "@/types";
import styles from "./CreatureCard.module.css";

const handleNumberWheel = (e: React.WheelEvent<HTMLInputElement>) =>
  e.currentTarget.blur();

interface StatBoxProps {
  label: string;
  note?: string;
  value: string;
  ariaLabel: string;
  onChange: (value: string) => void;
  onBlur: () => void;
}

// HP / Armor box, borrowed from the PC Playbook Stats section: a bordered number box with a
// serif sublabel beneath (e.g. "Max 24", "Made of stone").
const StatBox = memo(
  ({ label, note, value, ariaLabel, onChange, onBlur }: StatBoxProps) => {
    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value),
      [onChange],
    );
    return (
      <div className={styles.statBox}>
        <Text
          as="span"
          font="serif"
          size="sm"
          weight="bold"
          className={styles.statBoxLabel}
        >
          {label}
        </Text>
        <Input
          className={styles.statInput}
          type="number"
          value={value}
          min={0}
          aria-label={ariaLabel}
          onChange={handleChange}
          onBlur={onBlur}
          onWheel={handleNumberWheel}
        />
        {note !== undefined && (
          <Text
            as="span"
            font="serif"
            size="xs"
            color="muted"
            italic
            className={styles.statBoxNote}
          >
            {note}
          </Text>
        )}
      </div>
    );
  },
);

export interface CreatureCardProps {
  creature: Creature;
  // Per-field change — updates the host's working copy. Text edits typically persist on blur.
  onFieldChange: <K extends keyof Creature>(
    field: K,
    value: Creature[K],
  ) => void;
  // Flush pending text edits (call on blur).
  onBlur: () => void;
  className?: string;
}

export const CreatureCard = memo(
  ({ creature, onFieldChange, onBlur, className }: CreatureCardProps) => {
    const headingId = useId();
    const cx = clsx(styles.card, className);

    const handleName = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) =>
        onFieldChange("name", e.target.value),
      [onFieldChange],
    );
    const handleHp = useCallback(
      (value: string) => onFieldChange("hp", value),
      [onFieldChange],
    );
    const handleArmor = useCallback(
      (value: string) => onFieldChange("armor", value),
      [onFieldChange],
    );
    const handleLoyalty = useCallback(
      (n: number) => onFieldChange("loyalty", n),
      [onFieldChange],
    );

    const creatureLabel = creature.name || "creature";
    const hpNote = creature.hpMax ? `Max ${creature.hpMax}` : undefined;

    return (
      <section className={cx} aria-labelledby={headingId}>
        <Heading as="h3" id={headingId} className={styles.srOnly}>
          {creatureLabel}
        </Heading>
        <div className={styles.body}>
          <div className={styles.main}>
            <Input
              className={styles.nameInput}
              type="text"
              value={creature.name ?? ""}
              placeholder="Name"
              aria-label="Creature name"
              onChange={handleName}
              onBlur={onBlur}
            />
            {creature.tags && (
              <Text
                as="span"
                font="serif"
                italic
                color="muted"
                className={styles.tags}
              >
                {creature.tags}
              </Text>
            )}
            {(creature.qualities ?? []).length > 0 && (
              <div className={styles.qualities}>
                {(creature.qualities ?? []).map((quality, i) => (
                  <Text
                    key={`quality-${creature.id}-${i}`}
                    as="span"
                    font="serif"
                  >
                    {quality.label && (
                      <Text as="span" font="serif" weight="bold">
                        {`${quality.label} `}
                      </Text>
                    )}
                    <Text as="span" font="serif">
                      {quality.value}
                    </Text>
                  </Text>
                ))}
              </div>
            )}
            {!creature.hideLoyalty && (
              <div className={styles.loyalty}>
                <Text
                  as="span"
                  font="serif"
                  weight="bold"
                  className={styles.fieldLabel}
                >
                  Loyalty
                </Text>
                <UseDots
                  total={3}
                  checked={creature.loyalty ?? 0}
                  onChange={handleLoyalty}
                  ariaLabel="Loyalty"
                />
              </div>
            )}
            {(creature.moves ?? []).length > 0 && (
              <div className={styles.moves}>
                <Text
                  as="span"
                  font="serif"
                  weight="bold"
                  className={styles.fieldLabel}
                >
                  Moves
                </Text>
                <List
                  variant="bullet"
                  items={creature.moves ?? []}
                  keyPrefix={`move-${creature.id}`}
                />
              </div>
            )}
            {creature.notes && <Text font="serif">{creature.notes}</Text>}
          </div>

          <div className={styles.statBoxes}>
            <StatBox
              label="HP"
              note={hpNote}
              value={creature.hp ?? ""}
              ariaLabel="Current HP"
              onChange={handleHp}
              onBlur={onBlur}
            />
            <StatBox
              label="Armor"
              note={creature.armorNote}
              value={creature.armor ?? ""}
              ariaLabel="Armor"
              onChange={handleArmor}
              onBlur={onBlur}
            />
          </div>
        </div>
      </section>
    );
  },
);
