import { useState, useEffect, useCallback } from 'react';
import { Radio, Text, List } from '@/components/primitives';
import { PlaybookSection } from '../../PlaybookSection';
import type { CharacterData } from '@/types';
import styles from './FoxBackground.module.css';

interface BackgroundOption {
  value: string;
  title: string;
  paragraphs: React.ReactNode[];
  bullets?: React.ReactNode[];
}

const OPTIONS: BackgroundOption[] = [
  {
    value: 'the-natural',
    title: 'The Natural',
    paragraphs: [
      <>You grew up around here, and always picked things up quickly. Reading and numbers, sure, but more. Hide and seek. Throwing stones. Climbing. Fighting. Whatever you tried, you were good at it. As good as anyone else, if not better.</>,
      <>Sure, you've got a reputation for bending the rules. Playing dirty. But why play if you don't play to win, right? And who do they come to when there's a problem needs solving? You, that's who.</>,
      <>When you <strong>Seek Insight</strong>, you may roll +INT instead of +WIS and add "What opportunity does no one else see?" to the list of possible questions.</>,
    ],
  },
  {
    value: 'a-life-of-crime',
    title: 'A Life of Crime',
    paragraphs: [
      <>You're new to Stonetop, having left behind a… <em>colorful</em> past. How did you get into that life? Why and how did you get out? Who and what did you leave behind?</>,
      <>Regardless, these people have taken you in. Time to lead an honest life, right?</>,
      <>You start with either Burgle or Light Fingers (your choice) as an extra move, and either burglar tools or a hidden stash (your choice) as an additional special possession. Go mark them now.</>,
    ],
  },
  {
    value: 'the-prodigal-returned',
    title: 'The Prodigal Returned',
    paragraphs: [
      <>You left long ago, travelling far and living by your wits. Why did you leave? What deeds do you boast of, and which do you regret?</>,
      <>You always longed to return to Stonetop, and return you have. You're a bit of a celebrity now, and you've got friends (or close enough) strewn about the known world.</>,
      <>When you <strong><em>declare that you know someone outside of Stonetop</em></strong>, someone who can help, name them and roll +CHA: <strong>on a 10+</strong>, yeah, they can help (tell us why they're willing); <strong>on a 7-9</strong>, they can help but pick 1 from the list below; <strong>on a 6-</strong>, the GM chooses 1 and then some.</>,
    ],
    bullets: [
      <>They still hold a grudge</>,
      <>They're going to need something from you first</>,
      <>They swore off this sort of thing long ago</>,
      <>You can't exactly, y'know, trust them</>,
    ],
  },
];

interface FoxBackgroundProps {
  data: CharacterData | undefined;
  onSave: (data: Partial<CharacterData>) => Promise<void>;
}

export const FoxBackground = ({ data, onSave }: FoxBackgroundProps) => {
  const [selectedOption, setSelectedOption] = useState<string>(data?.background ?? '');

  useEffect(() => {
    if (data?.background !== undefined) setSelectedOption(data.background);
  }, [data?.background]);

  const handleOptionChange = useCallback((value: string) => {
    const prev = selectedOption;
    setSelectedOption(value);
    onSave({ background: value }).catch(() => setSelectedOption(prev));
  }, [onSave, selectedOption]);

  return (
    <PlaybookSection title="Background" choose={1}>
      <div className={styles.options}>
        {OPTIONS.map((opt) => (
          <div key={opt.value} className={styles.option}>
            <Radio
              name="fox-background"
              value={opt.value}
              checked={selectedOption === opt.value}
              onChange={() => handleOptionChange(opt.value)}
              label={<span className={styles.optionTitle}>{opt.title}</span>}
            />
            <div className={styles.optionBody}>
              {opt.paragraphs.map((p, i) => (
                <Text key={`${opt.value}-p${i}`} size="sm">{p}</Text>
              ))}
              {opt.bullets && (
                <List variant="bullet" items={opt.bullets} />
              )}
            </div>
          </div>
        ))}
      </div>
    </PlaybookSection>
  );
};
