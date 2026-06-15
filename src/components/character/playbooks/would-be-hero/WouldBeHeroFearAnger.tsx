import { PlaybookChecklistSection } from '../shared/PlaybookChecklistSection';
import type { AnswerPromptConfig, ChecklistGroup } from '../shared/PlaybookChecklistSection';
import type { PlaybookSectionProps } from '@/types';

const GROUPS: ChecklistGroup[] = [
  {
    label: 'What do you fear most? (choose 1, maybe 2)',
    max: 2,
    items: [
      { id: 'fear-fire', label: 'Fire, burning, the smell of charred flesh' },
      { id: 'fear-seriously', label: "That they won't take you seriously" },
      { id: 'fear-cutout', label: "That you really aren't cut out for this" },
      { id: 'fear-death', label: 'The death of your family or loved ones' },
      { id: 'fear-alone', label: 'Being alone and helpless' },
      { id: 'fear-violence', label: 'Violence, bloodshed, and pain' },
      { id: 'fear-monsters', label: 'Monsters' },
      { id: 'fear-capable', label: "What you're capable of" },
      { id: 'fear-must', label: 'What you must do' },
    ],
  },
  {
    label: 'What makes you burn with righteous anger? (choose 2, maybe 3)',
    max: 3,
    items: [
      { id: 'anger-bullying', label: 'Bullying, slavery, and oppression' },
      { id: 'anger-cruelty', label: 'Wanton cruelty and unnecessary suffering' },
      { id: 'anger-injustice', label: 'Injustice and inequality' },
      { id: 'anger-cowardice', label: 'Cowardice, treachery, and selfishness' },
      { id: 'anger-beauty', label: 'The despoiling of beauty and innocence' },
      { id: 'anger-loved', label: 'Threats to your loved ones' },
      { id: 'anger-innocent', label: 'Violence to children, animals, the innocent' },
      { id: 'anger-nature', label: 'Perversions of nature' },
    ],
  },
];

const ANSWER_PROMPTS: AnswerPromptConfig[] = [
  { key: 'when', label: 'When did your fear or anger last cause you trouble?' },
  { key: 'what', label: 'What did you do?' },
  { key: 'outcome', label: 'How did it turn out?' },
];

export const WouldBeHeroFearAnger = ({ data, onSave }: PlaybookSectionProps) => (
  <PlaybookChecklistSection
    title="Fear & Anger"
    featureKey="wouldBeHeroFearAnger"
    introVariant="xs"
    intro="When you **burn with righteous anger** (triggered by what you chose below), hold 2 Resolve. Spend Resolve 1-for-1 to set aside fear and doubt, act with uncanny speed, inspire allies, strike hard (+1d4 damage, *forceful*), or keep your footing despite what befalls you."
    groups={GROUPS}
    answerKey="wouldBeHeroFearAngerAnswers"
    answerPrompts={ANSWER_PROMPTS}
    data={data}
    onSave={onSave}
  />
);
