import { Heading } from '@/components/primitives';
import styles from './Playbook.module.css';

type Props = {
  title: string;
  children: React.ReactNode;
};

export const PlaybookCallout = ({ title, children }: Props) => (
  <div className={styles.callout}>
    <Heading as="h3" size="sm">{title}</Heading>
    {children}
  </div>
);
