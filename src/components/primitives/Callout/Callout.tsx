import { Heading } from '@/components/primitives/Heading/Heading';
import styles from './Callout.module.css';

type Props = {
  title: string;
  children: React.ReactNode;
};

export const Callout = ({ title, children }: Props) => (
  <div className={styles.callout}>
    <Heading as="h3" size="sm">{title}</Heading>
    {children}
  </div>
);
