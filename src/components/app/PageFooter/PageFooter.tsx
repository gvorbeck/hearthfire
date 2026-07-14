import styles from "./PageFooter.module.css";

/*
 * PageFooter — the legal/credit text at the bottom of every page.
 *
 * It has no props — the content never changes.
 */

const CURRENT_YEAR = new Date().getFullYear();

export const PageFooter = () => (
  <footer className={styles.footer}>
    {/* Game credit line — required by the CC BY-SA 4.0 license. */}
    Stonetop is written by Jeremy Strandberg and published by Lampblack &amp;
    Brimstone. Text released under CC BY-SA 4.0. Some concepts derived from
    Dungeon World by Sage LaTorra &amp; Adam Koebel (CC BY). Logo icon
    commissioned from{" "}
    <a
      className={styles.link}
      href="https://www.macteg.com/"
      target="_blank"
      rel="noreferrer"
    >
      Macteg
    </a>
    .
    <br />
    {/* App credit line — links to the developer's site and the GitHub repo. */}
    &copy; {CURRENT_YEAR}{" "}
    <a
      className={styles.link}
      href="https://iamgarrett.com"
      target="_blank"
      rel="noreferrer"
    >
      J. Garrett Vorbeck
    </a>
    {" · "}
    <a
      className={styles.link}
      href="https://github.com/gvorbeck/hearthfire"
      target="_blank"
      rel="noreferrer"
    >
      GitHub
    </a>
  </footer>
);
