import { useState, useEffect } from 'react';
import clsx from 'clsx';
import { Icon } from '../Icon/Icon';
import styles from './ScrollToTop.module.css';

interface ScrollToTopProps {
  sentinelRef: React.RefObject<HTMLDivElement | null>;
}

export const ScrollToTop = ({ sentinelRef }: ScrollToTopProps) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => setVisible(!entry.isIntersecting),
      { threshold: 0 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [sentinelRef]);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  const cx = clsx(styles.btn, visible && styles.visible);

  return (
    <button
      className={cx}
      onClick={scrollToTop}
      aria-label="Scroll to top"
      aria-hidden={!visible}
      tabIndex={visible ? 0 : -1}
    >
      <Icon name="chevron-up" size="medium" />
    </button>
  );
};
