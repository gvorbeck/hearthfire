import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { GmImprovement, SteadingData } from '@/types';
import { useToast } from '@/components/app';
import { ImprovementList } from './ImprovementList';

const FIXED_RESOURCES = [
  'Farming (beans, potatoes, oats, barley)',
  'Hunting/trapping (fur, meat, hides)',
  'Distilling (whisky)',
  'Stone (collected from the Old Wall)',
  'Cistern (filled with rain, snow)',
  'Tradesfolk (midwife, potter, publican, smith, tanner)',
  "Trade: Gordin's Delve (metal, tools)",
  'Trade: Marshedge (textiles, herbs, glass)',
];

const IMPROVEMENT_RESOURCES = [
  { id: 'aurochs-hunting', label: 'Aurochs hunting (meat, hide, horn)' },
  { id: 'harnessing-the-stream', label: 'Harnessing the Stream' },
  { id: 'inn', label: 'The Inn' },
  { id: 'mill', label: 'Mill' },
  { id: 'raincatching', label: 'Raincatching' },
];

interface SteadingResourcesProps {
  resources: string[] | undefined;
  improvements: Record<string, boolean> | undefined;
  gmImprovements: GmImprovement[] | undefined;
  onSave: (patch: Partial<SteadingData>) => Promise<void>;
}

export const SteadingResources = ({ resources, improvements = {}, gmImprovements, onSave }: SteadingResourcesProps) => {
  const { addToast } = useToast();
  const pendingRef = useRef(0);
  const [localResources, setLocalResources] = useState<string[]>(() => resources ?? []);

  useEffect(() => {
    if (pendingRef.current === 0) setLocalResources(resources ?? []);
  }, [resources]);

  const handleSave = useCallback((items: string[]) => {
    const prev = localResources;
    setLocalResources(items);
    pendingRef.current += 1;
    return onSave({ resources: items })
      .catch(() => { setLocalResources(prev); addToast('Failed to save.', 'error'); })
      .finally(() => { pendingRef.current -= 1; });
  }, [onSave, addToast, localResources]);

  const extraItems = useMemo(
    () => (gmImprovements ?? []).filter((g) => g.completed && g.category === 'resource' && g.title).map((g) => g.title),
    [gmImprovements],
  );

  return (
    <ImprovementList
      fixedItems={FIXED_RESOURCES}
      improvementItems={IMPROVEMENT_RESOURCES}
      extraItems={extraItems}
      customItems={localResources}
      improvements={improvements}
      onSave={handleSave}
      addLabel="Add resource"
      itemLabel="Custom resource"
    />
  );
};
