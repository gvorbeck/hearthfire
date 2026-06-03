import { useState, useRef, useEffect, useCallback, useId } from "react";
import {
  Button,
  Heading,
  Input,
  Text,
  RuleDivider,
  Tooltip,
} from "@/components/ui";
import { useToast } from "@/components/app";
import { Breadcrumb } from "./Breadcrumb";
import { SiteBanner } from "@/components/app/SiteBanner/SiteBanner";
import type { Crumb } from "@/types";
import styles from "./PageHeader.module.css";

/*
 * PageHeader — the semantic <header> landmark at the top of every page.
 * It contains up to three visual layers, rendered top to bottom:
 *
 *   1. SiteBanner — a site-wide notification strip (e.g. "Under Construction").
 *                   Optional — only rendered when there is something to say.
 *                   Always shown regardless of simple mode, because it carries
 *                   important information every visitor needs to see.
 *
 *   2. TopBar     — the "Hearthfire" wordmark strip. Identifies the app on
 *                   every full page. Not shown in simple mode (Home, NotFound)
 *                   where the page has its own hero treatment.
 *
 *   3. Page identity — breadcrumb trail, page title (optionally inline-editable),
 *                   optional subtitle, game ID with copy button, and a decorative
 *                   rule divider. Only shown in full mode.
 *
 * Props come in two shapes (TypeScript discriminated union):
 *
 *   simple={true}  — Home and NotFound. Renders SiteBanner only.
 *                    No wordmark, no breadcrumbs, no title, no game ID.
 *
 *   simple={false} (default) — All inner pages. Renders all three layers.
 *                    Title is read-only unless onSaveTitle + titleLabel are
 *                    provided, in which case an inline edit button appears.
 */

type SimpleProps = {
  simple: true;
};

type FullProps = {
  simple?: false;
  crumbs: Crumb[];
  title: string;
  subtitle?: string;
  icon?: React.ReactElement<SVGSVGElement>;
  gameId: string;
} & (
  | { onSaveTitle: (value: string) => Promise<void>; titleLabel: string }
  | { onSaveTitle?: never; titleLabel?: never }
);

type Props = SimpleProps | FullProps;

export const PageHeader = (props: Props) => {
  const { simple } = props;

  /*
   * All the editing/copy state below is only used in full mode.
   * Hooks must always be called unconditionally in React, so we declare
   * them here even though simple mode never touches them.
   */
  const { addToast } = useToast();
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState("");
  const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const copiedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const editTooltipId = useId();
  const copyTooltipId = useId();

  useEffect(() => {
    if (editing) inputRef.current?.select();
  }, [editing]);

  useEffect(() => {
    return () => {
      if (copiedTimerRef.current) clearTimeout(copiedTimerRef.current);
    };
  }, []);

  const startEditing = useCallback(() => {
    if (simple) return;
    setValue((props as FullProps).title);
    setEditing(true);
  }, [simple, props]);

  const commit = useCallback(async () => {
    if (simple) return;
    const fullProps = props as FullProps;
    const trimmed = value.trim();
    try {
      if (trimmed && trimmed !== fullProps.title) await fullProps.onSaveTitle?.(trimmed);
    } catch {
      addToast("Failed to save game name. Try again.", "error");
    } finally {
      setEditing(false);
    }
  }, [simple, props, value, addToast]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => setValue(e.target.value),
    [],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") commit();
      if (e.key === "Escape") setEditing(false);
    },
    [commit],
  );

  const copyGameId = useCallback(() => {
    if (simple) return;
    const { gameId } = props as FullProps;
    navigator.clipboard
      .writeText(gameId)
      .then(() => {
        setCopied(true);
        if (copiedTimerRef.current) clearTimeout(copiedTimerRef.current);
        copiedTimerRef.current = setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => addToast("Failed to copy game ID.", "error"));
  }, [simple, props, addToast]);

  const copyLabel = copied ? "Copied!" : "Copy game ID";

  return (
    /*
     * <header> is the correct semantic landmark here — it wraps the entire
     * top-of-page identity block, not just the wordmark strip.
     */
    <header className={styles.header}>

      {/*
       * SiteBanner — site-wide notification strip.
       * The content is hardcoded here because it applies to the whole site,
       * not to any individual page. Remove the JSX inside when the message
       * is no longer relevant; the banner disappears automatically when empty.
       */}
      <SiteBanner>
        <strong>Under Construction</strong> — This app is a work in progress.
        Found a bug?{" "}
        <a
          href="https://github.com/gvorbeck/hearthfire/issues"
          target="_blank"
          rel="noopener noreferrer"
        >
          Open an issue on GitHub.
        </a>
      </SiteBanner>

      {/*
       * TopBar — the "Hearthfire" wordmark strip.
       * Only shown in full mode. Simple pages (Home, NotFound) have their
       * own hero treatment and don't need the wordmark here.
       */}
      {!simple && (
        <div className={styles.topBar}>
          <Heading as="h1" size="md" className={styles.wordmark}>Hearthfire</Heading>
        </div>
      )}

      {/*
       * Page identity — breadcrumbs, title, game ID.
       * Only rendered in full mode. Each piece below:
       *
       *   Breadcrumb   — shows where you are, e.g. "My Game → GM Playbook"
       *   titleRow     — the page title; pencil button appears if editable
       *   subtitle     — optional smaller label below the title
       *   gameId row   — the game's unique ID with a one-click copy button
       *   RuleDivider  — decorative horizontal rule to close the header block
       */}
      {!simple && (() => {
        const { crumbs, title, subtitle, icon, gameId } = props as FullProps;
        const fullProps = props as FullProps;
        const onSaveTitle = fullProps.onSaveTitle;
        const titleLabel = fullProps.titleLabel;

        return (
          <div className={styles.body}>
            <Breadcrumb crumbs={crumbs} />
            <div className={styles.titleRow}>
              {icon && (
                <span className={styles.titleIcon} aria-hidden="true">
                  {icon}
                </span>
              )}
              {onSaveTitle && editing ? (
                <Input
                  ref={inputRef as React.Ref<HTMLInputElement>}
                  className={styles.titleInput}
                  value={value}
                  onChange={handleChange}
                  onBlur={commit}
                  onKeyDown={handleKeyDown}
                  aria-label={titleLabel}
                />
              ) : (
                <>
                  <Heading as="h2" size="xl">
                    {title}
                  </Heading>
                  {onSaveTitle && (
                    <Tooltip
                      text="Edit name"
                      side="top"
                      noTabStop
                      tooltipId={editTooltipId}
                    >
                      <Button
                        variant="ghost"
                        icon="pencil"
                        size="sm"
                        className={styles.editBtn}
                        onClick={startEditing}
                        aria-label={titleLabel!}
                        aria-describedby={editTooltipId}
                      />
                    </Tooltip>
                  )}
                </>
              )}
            </div>
            {subtitle && (
              <Text color="muted" size="xs" className={styles.subtitle}>
                {subtitle}
              </Text>
            )}
            <div className={styles.gameId}>
              <Text color="muted" size="xs">
                Game ID:{" "}
                <Text as="span" color="accent" size="xs">
                  {gameId}
                </Text>
              </Text>
              <Tooltip
                text={copyLabel}
                side="top"
                noTabStop
                tooltipId={copyTooltipId}
              >
                <Button
                  variant="ghost"
                  icon={copied ? "check" : "copy"}
                  size="sm"
                  className={styles.copyBtn}
                  onClick={copyGameId}
                  aria-label={copyLabel}
                  aria-describedby={copyTooltipId}
                />
              </Tooltip>
            </div>
            <RuleDivider className={styles.rule} />
          </div>
        );
      })()}
    </header>
  );
};
