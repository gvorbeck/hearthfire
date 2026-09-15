import { useCallback, useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
import clsx from 'clsx';
import { EditorContent, useEditor, useEditorState, type Editor } from '@tiptap/react';
import { StarterKit } from '@tiptap/starter-kit';
import { useFirestoreSync } from '@/hooks/useFirestoreSync';
import { useLatest } from '@/hooks/useLatest';
import { useNotesLock } from '@/hooks/useNotesLock';
import { Text } from '@/components/ui';
import type { NotesLock } from '@/types';
import styles from './SharedNotes.module.css';

export interface NotesEditorProps {
  html: string;
  lock: NotesLock | undefined;
  label: string;
  onSave: (html: string) => Promise<void>;
  onClaim: () => Promise<boolean>;
  onRefresh: () => Promise<void>;
  onRelease: (html: string) => Promise<void>;
}

interface Tool {
  id: string;
  label: string;
  glyph: string;
  glyphClass?: string;
  // Absent for one-shot actions (the divider), which get no pressed state.
  isActive?: (editor: Editor) => boolean;
  run: (editor: Editor) => void;
}

const TOOLS: Tool[] = [
  { id: 'bold', label: 'Bold', glyph: 'B', glyphClass: styles.glyphBold, isActive: (e) => e.isActive('bold'), run: (e) => e.chain().focus().toggleBold().run() },
  { id: 'italic', label: 'Italic', glyph: 'I', glyphClass: styles.glyphItalic, isActive: (e) => e.isActive('italic'), run: (e) => e.chain().focus().toggleItalic().run() },
  { id: 'underline', label: 'Underline', glyph: 'U', glyphClass: styles.glyphUnderline, isActive: (e) => e.isActive('underline'), run: (e) => e.chain().focus().toggleUnderline().run() },
  { id: 'heading-2', label: 'Heading', glyph: 'H2', isActive: (e) => e.isActive('heading', { level: 2 }), run: (e) => e.chain().focus().toggleHeading({ level: 2 }).run() },
  { id: 'heading-3', label: 'Subheading', glyph: 'H3', isActive: (e) => e.isActive('heading', { level: 3 }), run: (e) => e.chain().focus().toggleHeading({ level: 3 }).run() },
  { id: 'bullet-list', label: 'Bulleted list', glyph: '•', isActive: (e) => e.isActive('bulletList'), run: (e) => e.chain().focus().toggleBulletList().run() },
  { id: 'ordered-list', label: 'Numbered list', glyph: '1.', isActive: (e) => e.isActive('orderedList'), run: (e) => e.chain().focus().toggleOrderedList().run() },
  { id: 'blockquote', label: 'Quote', glyph: '“', isActive: (e) => e.isActive('blockquote'), run: (e) => e.chain().focus().toggleBlockquote().run() },
  { id: 'divider', label: 'Divider', glyph: '—', run: (e) => e.chain().focus().setHorizontalRule().run() },
];

// Only the formatting the toolbar offers. Everything else StarterKit would add (links, code, strike) is
// off so pasted content can't introduce marks the notes have no controls to remove.
const EXTENSIONS = [
  StarterKit.configure({
    heading: { levels: [2, 3] },
    code: false,
    codeBlock: false,
    strike: false,
    link: false,
  }),
];

interface ToolbarProps {
  editor: Editor;
  disabled: boolean;
  controlsId: string;
}

// A single tab stop with arrow-key movement between buttons (WAI-ARIA toolbar pattern), so keyboard users
// aren't forced through nine buttons to get from the heading to the text.
const Toolbar = ({ editor, disabled, controlsId }: ToolbarProps) => {
  const [focusIndex, setFocusIndex] = useState(0);
  const buttonsRef = useRef<(HTMLButtonElement | null)[]>([]);

  const active = useEditorState({
    editor,
    selector: ({ editor: e }) => TOOLS.map((tool) => tool.isActive?.(e) ?? false),
    equalityFn: (a, b) => !!b && a.every((v, i) => v === b[i]),
  });

  const handleKeyDown = useCallback((event: KeyboardEvent<HTMLDivElement>) => {
    const last = TOOLS.length - 1;
    const next = {
      ArrowRight: focusIndex === last ? 0 : focusIndex + 1,
      ArrowLeft: focusIndex === 0 ? last : focusIndex - 1,
      Home: 0,
      End: last,
    }[event.key];
    if (next === undefined) return;
    event.preventDefault();
    setFocusIndex(next);
    buttonsRef.current[next]?.focus();
  }, [focusIndex]);

  return (
    <div
      className={styles.toolbar}
      role="toolbar"
      aria-label="Formatting"
      aria-controls={controlsId}
      onKeyDown={handleKeyDown}
    >
      {TOOLS.map((tool, i) => {
        const buttonCx = clsx(styles.toolButton, active[i] && styles.toolButtonActive);
        return (
          <button
            key={tool.id}
            ref={(el) => { buttonsRef.current[i] = el; }}
            type="button"
            className={buttonCx}
            tabIndex={i === focusIndex ? 0 : -1}
            aria-label={tool.label}
            aria-pressed={tool.isActive ? active[i] : undefined}
            title={tool.label}
            disabled={disabled}
            // Keep the editor's selection: without this the click blurs the editor first, which both loses
            // the selection the command should apply to and fires an unwanted blur save.
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => { setFocusIndex(i); tool.run(editor); }}
          >
            <span className={tool.glyphClass} aria-hidden="true">{tool.glyph}</span>
          </button>
        );
      })}
    </div>
  );
};

export const NotesEditor = ({ html, lock, label, onSave, onClaim, onRefresh, onRelease }: NotesEditorProps) => {
  const editorRef = useRef<Editor | null>(null);
  const htmlRef = useLatest(html);
  const contentId = useId();
  const statusId = useId();

  const { othersTyping, noteChange, noteBlur, isBusy } = useNotesLock({
    lock,
    getHtml: () => editorRef.current?.getHTML() ?? '',
    claim: onClaim,
    refresh: onRefresh,
    release: onRelease,
    save: onSave,
    onClaimRejected: () => {
      const editor = editorRef.current;
      if (editor && !editor.isDestroyed) editor.commands.setContent(htmlRef.current, { emitUpdate: false });
    },
  });

  const editor = useEditor({
    extensions: EXTENSIONS,
    content: html,
    onUpdate: noteChange,
    onBlur: noteBlur,
  });

  useEffect(() => {
    editorRef.current = editor;
  }, [editor]);

  // Lock the editor while someone else types. setOptions (not setEditable) so no update event fires — an
  // update would count as a keystroke here and try to claim the lock. The editable element's attributes
  // live here too (applied on mount) since aria-readonly has to follow the lock.
  useEffect(() => {
    editor.setOptions({
      editable: !othersTyping,
      editorProps: {
        attributes: {
          id: contentId,
          class: styles.content,
          role: 'textbox',
          'aria-multiline': 'true',
          'aria-label': label,
          'aria-readonly': String(othersTyping),
          'aria-describedby': statusId,
        },
      },
    });
  }, [editor, othersTyping, contentId, statusId, label]);

  // Apply remote content only when this tab has nothing of its own in play; a value that lands mid-edit is
  // deferred and applied once the edit settles (see useFirestoreSync).
  useFirestoreSync(html, (remote) => {
    if (editor.isDestroyed || editor.getHTML() === remote || (editor.isEmpty && remote === '')) return;
    editor.commands.setContent(remote, { emitUpdate: false });
  }, isBusy);

  const editorCx = clsx(styles.editor, othersTyping && styles.editorLocked);

  return (
    <div className={editorCx}>
      <Toolbar editor={editor} disabled={othersTyping} controlsId={contentId} />
      <EditorContent editor={editor} />
      {/* Always mounted so screen readers announce the message when it appears. */}
      <div id={statusId} className={styles.status} aria-live="polite">
        {othersTyping && <Text as="span" size="xs" color="muted" italic>Someone is typing…</Text>}
      </div>
    </div>
  );
};
