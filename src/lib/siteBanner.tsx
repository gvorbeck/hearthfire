import type { ReactNode } from "react";

// Set to null to hide the banner entirely.
export const SITE_BANNER: ReactNode = (
  <>
    <strong>Under Construction</strong> — This app is a work in progress. Found
    a bug?{" "}
    <a
      href="https://github.com/gvorbeck/hearthfire/issues"
      target="_blank"
      rel="noopener noreferrer"
    >
      Open an issue on GitHub.
    </a>
  </>
);
