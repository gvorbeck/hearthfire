import { useMemo, useCallback } from 'react';
import { useLatest } from '@/hooks/useLatest';
import { useCharacterField } from '@/hooks/useCharacterField';
import { Divider, PlaybookColumns } from '@/components/ui';
import { PlaybookSection } from '@/components/playbook/PlaybookSection';
import type { PlaybookSectionProps } from '@/types';
import { computeTotalLoad, getShieldWeight } from './inventoryData';
import { useArcanaWeights } from './useArcanaWeights';
import { MainInventorySection } from './MainInventorySection';
import { SmallInventorySection } from './SmallInventorySection';
import { ProsperitySection } from './ProsperitySection';
import { OtherThingsField } from './OtherThingsField';

interface InventoryProps extends PlaybookSectionProps {
  prosperity: number;
}

export const Inventory = ({ data, prosperity, onSave }: InventoryProps) => {
  const onSaveRef = useLatest(onSave);

  const { value: inventoryChecked, ref: inventoryCheckedRef, save: saveInventoryChecked } = useCharacterField('inventoryChecked', data?.inventoryChecked ?? {}, onSave, 'Failed to save.');
  const { value: inventoryUses, ref: inventoryUsesRef, save: saveInventoryUses } = useCharacterField('inventoryUses', data?.inventoryUses ?? {}, onSave, 'Failed to save.');
  const { value: smallChecked, ref: smallCheckedRef, save: saveSmallChecked } = useCharacterField('inventorySmallChecked', data?.inventorySmallChecked ?? {}, onSave, 'Failed to save.');
  const { value: undefinedMain, save: saveUndefinedMain } = useCharacterField('inventoryUndefined', data?.inventoryUndefined ?? 0, onSave, 'Failed to save.');
  const { value: undefinedSmall, save: saveUndefinedSmall } = useCharacterField('inventorySmallUndefined', data?.inventorySmallUndefined ?? 0, onSave, 'Failed to save.');
  const { value: arcanaMinor, ref: arcanaMinorRef, save: saveArcanaMinor } = useCharacterField('arcanaMinor', data?.arcanaMinor ?? [], onSave, 'Failed to save.');
  const { value: arcanaMajor, ref: arcanaMajorRef, save: saveArcanaMajor } = useCharacterField('arcanaMajor', data?.arcanaMajor ?? [], onSave, 'Failed to save.');

  const handleMainChecked = useCallback((id: string, val: boolean) => {
    saveInventoryChecked({ ...inventoryCheckedRef.current, [id]: val });
  }, [saveInventoryChecked]);

  const handleMainUses = useCallback((id: string, n: number) => {
    saveInventoryUses({ ...inventoryUsesRef.current, [id]: n });
  }, [saveInventoryUses]);

  const handleUndefinedMain = useCallback((n: number) => {
    saveUndefinedMain(n);
  }, [saveUndefinedMain]);

  const handleUndefinedSmall = useCallback((n: number) => {
    saveUndefinedSmall(n);
  }, [saveUndefinedSmall]);

  const handleSmallChecked = useCallback((id: string, val: boolean) => {
    saveSmallChecked({ ...smallCheckedRef.current, [id]: val });
  }, [saveSmallChecked]);

  const handleSavePossessions = useCallback(async (items: { checked: boolean; text: string; weight: 1 | 2 }[]) => {
    await onSaveRef.current({ inventoryPossessions: items });
  }, [onSaveRef]);

  const handleSaveSmallCustom = useCallback(async (items: { checked: boolean; text: string }[]) => {
    await onSaveRef.current({ inventorySmallCustom: items });
  }, [onSaveRef]);

  const handleArcanaCarried = useCallback((id: string, carried: boolean) => {
    saveArcanaMinor(arcanaMinorRef.current.map((e) => e.id === id ? { ...e, carried } : e));
  }, [saveArcanaMinor]);

  const handleArcanaMajorCarried = useCallback((id: string, carried: boolean) => {
    saveArcanaMajor(arcanaMajorRef.current.map((e) => e.id === id ? { ...e, carried } : e));
  }, [saveArcanaMajor]);

  // Arcana weights load lazily (see useArcanaWeights); null means the carried-arcana weights
  // aren't in yet, so the load total stays pending rather than showing a value missing them.
  const arcanaWeights = useArcanaWeights(arcanaMinor, arcanaMajor);

  const totalLoad = useMemo(
    () => arcanaWeights === null
      ? null
      : computeTotalLoad({ ...data, inventoryChecked, inventoryUndefined: undefinedMain, arcanaMinor, arcanaMajor }, arcanaWeights.minor, arcanaWeights.major),
    [inventoryChecked, data, undefinedMain, arcanaMinor, arcanaMajor, arcanaWeights],
  );

  return (
    <PlaybookColumns
      left={
        <PlaybookSection title="Inventory">
          <MainInventorySection
            totalLoad={totalLoad}
            prosperity={prosperity}
            shieldWeight={getShieldWeight(data)}
            inventoryChecked={inventoryChecked}
            inventoryUses={inventoryUses}
            undefinedMain={undefinedMain}
            arcanaMinor={arcanaMinor}
            arcanaMajor={arcanaMajor}
            arcanaWeights={arcanaWeights}
            possessions={data?.inventoryPossessions ?? []}
            onMainChecked={handleMainChecked}
            onMainUses={handleMainUses}
            onUndefinedChange={handleUndefinedMain}
            onArcanaMinorCarried={handleArcanaCarried}
            onArcanaMajorCarried={handleArcanaMajorCarried}
            onSavePossessions={handleSavePossessions}
          />

          <Divider />

          <OtherThingsField value={data?.inventoryOtherThings ?? ''} onSave={onSave} />
        </PlaybookSection>
      }
      right={<>
        <SmallInventorySection
          smallChecked={smallChecked}
          undefinedSmall={undefinedSmall}
          smallCustom={data?.inventorySmallCustom ?? []}
          onSmallChecked={handleSmallChecked}
          onUndefinedChange={handleUndefinedSmall}
          onSaveSmallCustom={handleSaveSmallCustom}
        />

        <ProsperitySection prosperity={prosperity} />
      </>}
    />
  );
};
