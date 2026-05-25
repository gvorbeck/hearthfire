import { CheckboxGroup, Text } from '@/components/primitives';
import { PlaybookSection } from '../../PlaybookSection';
import { parseInlineMarkdown } from '@/lib/parseMarkdown';
import styles from './RangerAnimalCompanion.module.css';

const BEAST_OF_LEGEND_ITEMS = [
  { id: 'bol-exceptional', label: 'They are *exceptional* (see Order Followers below)' },
  { id: 'bol-hp-armor', label: 'They get +4 HP and +1 armor' },
  { id: 'bol-unique', label: 'They develop a unique ability or trait' },
].map((opt) => ({
  id: opt.id,
  label: <span>{parseInlineMarkdown(opt.label)}</span>,
}));

interface BeastOfLegendProps {
  beastOfLegend: Record<string, boolean>;
  onBeastOfLegendChange: (id: string, checked: boolean) => void;
}

export const BeastOfLegend = ({ beastOfLegend, onBeastOfLegendChange }: BeastOfLegendProps) => (
  <PlaybookSection title="Beast of Legend">
    <Text as="p" size="sm" color="muted" className={styles.prose}>
      Each time you take Beast of Legend, pick 1:
    </Text>
    <CheckboxGroup
      items={BEAST_OF_LEGEND_ITEMS}
      checked={beastOfLegend}
      onChange={onBeastOfLegendChange}
    />
  </PlaybookSection>
);
