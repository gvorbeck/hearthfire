// Splits on **bold**, *italic*, and Stonetop roll result phrases.
// AUTO_BOLD phrases are bolded without needing explicit ** markers.
const INLINE_RE = /(\*\*[^*]+\*\*|\*[^*]+\*|on a 10\+|on a 7[-–]9|on a 6[-–]|either way)/i;
const AUTO_BOLD_RE = /^(on a 10\+|on a 7[-–]9|on a 6[-–]|either way)$/i;

export const parseInlineMarkdown = (text: string): React.ReactNode[] =>
  text.split(INLINE_RE).reduce<React.ReactNode[]>((acc, chunk, i) => {
    if (!chunk) return acc;
    if (chunk.startsWith('**')) return [...acc, <strong key={i}>{chunk.slice(2, -2)}</strong>];
    if (chunk.startsWith('*')) return [...acc, <em key={i}>{chunk.slice(1, -1)}</em>];
    if (AUTO_BOLD_RE.test(chunk)) return [...acc, <strong key={i}>{chunk}</strong>];
    return [...acc, chunk];
  }, []);
