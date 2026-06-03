import { PageFooter } from '@/components/app/PageFooter/PageFooter';
import { PageHeader } from '@/components/app/PageHeader/PageHeader';
import type { Crumb } from '@/types';
import styles from './PageLayout.module.css';

/*
 * PageLayout — the foundational shell that every page is built inside.
 *
 * Think of it like a picture frame: it provides the consistent outer
 * structure so individual pages only need to worry about their own content.
 * Every page gets:
 *
 *   PageHeader   — always rendered. In simple mode it shows only the
 *                  SiteBanner (if one is active). In full mode it also
 *                  shows the wordmark, breadcrumbs, page title, and game ID.
 *
 *   <main>       — the scrollable content area. Page content goes here.
 *
 *   PageFooter   — legal/credit text. Always shown.
 *
 * There are two prop shapes:
 *
 *   simple={true}  — Home and NotFound. PageHeader renders SiteBanner only.
 *                    No wordmark, no breadcrumbs, no title, no game ID.
 *
 *   simple={false} (default) — All inner pages (Game, GM Playbook, Steading,
 *                    Character Playbook). PageHeader renders all layers.
 *                    Also pass onSaveTitle + titleLabel to make the title
 *                    inline-editable.
 *
 * TypeScript enforces the two shapes so you can't accidentally pass
 * header props in simple mode or forget them in full mode.
 */

type SimpleProps = {
  simple: true;
  children: React.ReactNode;
};

type FullProps = {
  simple?: false;
  children: React.ReactNode;
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

export const PageLayout = (props: Props) => {
  const { simple, children } = props;

  return (
    <>
      {/*
       * PageHeader is always rendered — even in simple mode — because the
       * SiteBanner inside it must be visible on every page. The `simple`
       * prop controls how much of the header is shown beyond the banner.
       *
       * We split into two JSX branches here to satisfy TypeScript's
       * discriminated union: PageHeader requires either both onSaveTitle +
       * titleLabel, or neither. A single spread would lose that guarantee.
       */}
      {simple ? (
        <PageHeader simple />
      ) : (
        'onSaveTitle' in props && props.onSaveTitle ? (
          <PageHeader
            crumbs={props.crumbs}
            title={props.title}
            subtitle={props.subtitle}
            icon={props.icon}
            gameId={props.gameId}
            onSaveTitle={props.onSaveTitle}
            titleLabel={props.titleLabel!}
          />
        ) : (
          <PageHeader
            crumbs={(props as FullProps).crumbs}
            title={(props as FullProps).title}
            subtitle={(props as FullProps).subtitle}
            icon={(props as FullProps).icon}
            gameId={(props as FullProps).gameId}
          />
        )
      )}

      {/*
       * In simple mode, <main> has no padding or max-width — Home and NotFound
       * own their full layout. In full mode, <main> applies the shared
       * 1200px constraint and padding used by all inner pages.
       */}
      <main className={simple ? styles.mainSimple : styles.main}>
        {children}
      </main>

      <PageFooter />
    </>
  );
};
