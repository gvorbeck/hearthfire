import { memo, useCallback, useEffect, useRef, useState } from "react";
import { CreatureCard } from "@/components/ui";
import { useLatest } from "@/hooks/useLatest";
import type { Creature } from "@/types";

interface MysteryCreatureCardProps {
  // Fully projected creature: book data (from seed + marked consequences) with the player's saved
  // HP/armor/loyalty already merged in. Recomputed upstream whenever a consequence toggles.
  creature: Creature;
  onSave: (creature: Creature) => void;
}

// Wraps the presentational CreatureCard with optimistic local state, persisting the player's edits
// (HP, armor, loyalty) onto the arcanum entry. Text edits save on blur; loyalty saves immediately
// since it has no blur. The book-data fields are read-only here — they come from the projection.
export const MysteryCreatureCard = memo(
  ({ creature: projected, onSave }: MysteryCreatureCardProps) => {
    const [creature, setCreature] = useState<Creature>(projected);
    const creatureRef = useLatest(creature);
    const onSaveRef = useLatest(onSave);

    // Re-sync when a genuinely new projection arrives (a consequence toggled, or a fresh Firestore
    // snapshot), not on every local keystroke re-render.
    const lastSavedRef = useRef<string>(JSON.stringify(projected));
    useEffect(() => {
      const incoming = JSON.stringify(projected);
      if (incoming === lastSavedRef.current) return;
      lastSavedRef.current = incoming;
      setCreature(projected);
    }, [projected]);

    const commit = useCallback((next: Creature) => {
      setCreature(next);
      lastSavedRef.current = JSON.stringify(next);
      onSaveRef.current(next);
    }, []);

    const handleFieldChange = useCallback(
      <K extends keyof Creature>(field: K, value: Creature[K]) => {
        const next = { ...creatureRef.current, [field]: value };
        // Loyalty has no blur, so persist it right away; text fields persist on blur.
        if (field === "loyalty") {
          commit(next);
        } else {
          setCreature(next);
        }
      },
      [commit],
    );

    const handleBlur = useCallback(() => commit(creatureRef.current), [commit]);

    return (
      <CreatureCard
        creature={creature}
        onFieldChange={handleFieldChange}
        onBlur={handleBlur}
      />
    );
  },
);
