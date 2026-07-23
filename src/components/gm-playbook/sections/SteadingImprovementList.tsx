import { useCallback, useMemo } from 'react';
import type { GmImprovement, SteadingData } from '@/types';
import { useOptimisticField } from '@/hooks/useOptimisticField';
import { ImprovementList } from './ImprovementList';

interface ImprovementOption {
  id: string;
  label: string;
  // When set, this option supersedes the option with id `replaces` once enabled —
  // the replaced option is hidden so only the upgrade shows (e.g. Stone Wall over Palisade).
  replaces?: string;
}

interface SteadingImprovementListConfig {
  // Which SteadingData list field this section persists.
  fieldKey: 'resources' | 'fortifications';
  // Which gmImprovement category surfaces as auto-added extra items.
  gmCategory: GmImprovement['category'];
  fixedItems: string[];
  improvementItems: ImprovementOption[];
  addLabel: string;
  itemLabel: string;
}

interface SteadingImprovementListProps {
  config: SteadingImprovementListConfig;
  items: string[] | undefined;
  improvements: Record<string, boolean> | undefined;
  gmImprovements: GmImprovement[] | undefined;
  removedFixedItems: string[] | undefined;
  onSave: (patch: Partial<SteadingData>) => Promise<void>;
}

/**
 * Shared list section for Steading Resources and Fortifications: a bulleted list
 * of fixed + improvement-derived + GM-granted items, plus a repeater of custom
 * entries. The two sections differ only by the `config` passed in.
 */
export const SteadingImprovementList = ({
  config,
  items,
  improvements = {},
  gmImprovements,
  removedFixedItems,
  onSave,
}: SteadingImprovementListProps) => {
  const { fieldKey, gmCategory, fixedItems, improvementItems, addLabel, itemLabel } = config;

  const firestoreItems = items ?? [];
  const { value: localItems, save } = useOptimisticField(
    firestoreItems,
    (next: string[]) => onSave({ [fieldKey]: next }),
  );

  const firestoreRemovedFixed = removedFixedItems ?? [];
  const { value: localRemovedFixed, save: saveRemovedFixed } = useOptimisticField(
    firestoreRemovedFixed,
    (next: string[]) => onSave({ removedFixedItems: next }),
  );

  const handleSave = useCallback((next: string[]) => save(() => next), [save]);
  const handleRemoveFixed = useCallback(
    (label: string) => saveRemovedFixed((current) => current.includes(label) ? current : [...current, label]),
    [saveRemovedFixed],
  );

  // Hide any improvement that a chosen upgrade replaces (e.g. Palisade once Stone Wall is enabled).
  const visibleImprovements = useMemo(() => {
    const replaced = new Set(
      improvementItems.filter((imp) => imp.replaces && improvements[imp.id]).map((imp) => imp.replaces!),
    );
    return improvementItems.filter((imp) => !replaced.has(imp.id));
  }, [improvementItems, improvements]);

  const extraItems = useMemo(
    () => (gmImprovements ?? []).filter((g) => g.completed && g.category === gmCategory && g.title).map((g) => g.title),
    [gmImprovements, gmCategory],
  );

  return (
    <ImprovementList
      fixedItems={fixedItems}
      improvementItems={visibleImprovements}
      extraItems={extraItems}
      customItems={localItems}
      improvements={improvements}
      onSave={handleSave}
      addLabel={addLabel}
      itemLabel={itemLabel}
      removedFixedItems={localRemovedFixed}
      onRemoveFixed={handleRemoveFixed}
    />
  );
};

export const RESOURCES_CONFIG: SteadingImprovementListConfig = {
  fieldKey: 'resources',
  gmCategory: 'resource',
  fixedItems: [
    'Farming (beans, potatoes, oats, barley)',
    'Hunting/trapping (fur, meat, hides)',
    'Distilling (whisky)',
    'Stone (collected from the Old Wall)',
    'Cistern (filled with rain, snow)',
    'Tradesfolk (midwife, potter, publican, smith, tanner)',
    "Trade: Gordin's Delve (metal, tools)",
    'Trade: Marshedge (textiles, herbs, glass)',
  ],
  improvementItems: [
    { id: 'aurochs-hunting', label: 'Aurochs hunting (meat, hide, horn)' },
    { id: 'harnessing-the-stream', label: 'Harnessing the Stream' },
    { id: 'inn', label: 'The Inn' },
    { id: 'mill', label: 'Mill' },
    { id: 'raincatching', label: 'Raincatching' },
  ],
  addLabel: 'Add resource',
  itemLabel: 'Custom resource',
};

export const FORTIFICATIONS_CONFIG: SteadingImprovementListConfig = {
  fieldKey: 'fortifications',
  gmCategory: 'fortification',
  fixedItems: [
    'Village militia',
    'The Ringwall (low, stone)',
    '3 watchtowers',
    'Spears & shields in every home',
    'Some bows',
  ],
  improvementItems: [
    { id: 'palisade', label: 'Palisade' },
    { id: 'standing-watch', label: 'Standing Watch' },
    { id: 'stone-wall', label: 'Stone Wall', replaces: 'palisade' },
    { id: 'weapons-of-war', label: 'Weapons of War' },
    { id: 'well-trained-militia', label: 'Well-Trained Militia' },
  ],
  addLabel: 'Add fortification',
  itemLabel: 'Custom fortification',
};
