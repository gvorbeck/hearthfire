import { Link, useNavigate } from "react-router-dom";
import clsx from "clsx";
import { Dropdown } from "@/components/ui";
import type { GameNav } from "./gameNav";
import styles from "./PageNav.module.css";

/*
 * PageNav — lateral navigation between the sibling pages of a game (each
 * character sheet, the GM playbook, the Steading playbook).
 *
 * Renders two interchangeable affordances, toggled purely by CSS at the 768px
 * breakpoint:
 *
 *   - Wide viewports — a visible pill bar of links, so the most frequent
 *     in-session navigation is one click and the destinations are always
 *     discoverable. The current page is marked with aria-current="page".
 *   - Narrow viewports — the original grouped <Dropdown>, which stays compact
 *     where a horizontal bar of links would wrap badly.
 *
 * The flat pill list is derived from the same `groups` the dropdown consumes,
 * so the two stay in sync without a second source of truth.
 */

type PageNavProps = {
  nav: GameNav;
  dropdownId: string;
};

export const PageNav = ({ nav, dropdownId }: PageNavProps) => {
  const navigate = useNavigate();

  // Flatten the dropdown's grouped options into the single ordered list the
  // pill bar renders. Group boundaries don't matter for the pills.
  const items = nav.groups.flatMap((group) => group.options);

  // A native <select> only fires onChange when the value actually changes, so
  // the chosen path is always a different page — navigate straight to it.
  const handleDropdownChange = (path: string) => navigate(path);

  return (
    <>
      <nav aria-label="Switch page" className={styles.pills}>
        <ul className={styles.pillList}>
          {items.map((item) => {
            const isCurrent = item.value === nav.current;
            const pillCx = clsx(styles.pill, isCurrent && styles.pillCurrent);
            return (
              <li key={item.value} className={styles.pillItem}>
                {isCurrent ? (
                  <span className={pillCx} aria-current="page">
                    {item.label}
                  </span>
                ) : (
                  <Link to={item.value} className={pillCx}>
                    {item.label}
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      </nav>
      {/*
       * Wrap the Dropdown in our own element to toggle visibility: the
       * className the Dropdown accepts lands on its inner <select>, not its
       * wrapper, so hiding via that prop would leave the chevron floating.
       */}
      <div className={styles.dropdown}>
        <Dropdown
          id={dropdownId}
          aria-label="Switch to another page"
          groups={nav.groups}
          value={nav.current}
          placeholder="Switch to…"
          onChange={handleDropdownChange}
        />
      </div>
    </>
  );
};
