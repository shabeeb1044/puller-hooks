'use client';

import { useEffect, type ReactNode } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import { TextStyle, Color } from '@tiptap/extension-text-style';

type RichTextFieldProps = {
  label: string;
  value?: string | null;
  onChange: (html: string) => void;
  minHeight?: number;
  compact?: boolean;
};

/** Brand colors already used on the site. */
export const RTE_TEXT_COLORS = [
  { id: 'yellow', label: 'Yellow', value: '#f7ed22' },
  { id: 'white', label: 'White', value: '#ffffff' },
  { id: 'black', label: 'Black', value: '#111111' },
  { id: 'red', label: 'Red', value: '#d81e37' },
] as const;

function ToolbarButton({
  onClick,
  active,
  label,
  children,
  className = '',
}: {
  onClick: () => void;
  active?: boolean;
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      className={`admin-rte-btn${active ? ' is-active' : ''}${className ? ` ${className}` : ''}`}
      aria-label={label}
      title={label}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

export default function RichTextField({
  label,
  value = '',
  onChange,
  minHeight = 120,
  compact = false,
}: RichTextFieldProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: compact ? false : { levels: [2, 3] },
        bulletList: compact ? false : undefined,
        orderedList: compact ? false : undefined,
        blockquote: false,
        code: false,
        codeBlock: false,
        horizontalRule: false,
      }),
      Underline,
      TextStyle.configure({ mergeNestedSpanStyles: true }),
      Color.configure({ types: ['textStyle'] }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { rel: 'noopener noreferrer', target: '_blank' },
      }),
    ],
    content: value || '',
    onUpdate: ({ editor: ed }) => {
      onChange(ed.getHTML());
    },
    editorProps: {
      attributes: {
        class: `admin-rte-content${compact ? ' admin-rte-content--compact' : ''}`,
        style: `min-height: ${minHeight}px`,
      },
    },
  });

  useEffect(() => {
    if (!editor) return;
    const next = value || '';
    const current = editor.getHTML();
    if (next === current) return;
    if ((!next || next === '<p></p>') && editor.isEmpty) return;
    editor.commands.setContent(next || '', { emitUpdate: false });
  }, [editor, value]);

  function setLink() {
    if (!editor) return;
    const previous = editor.getAttributes('link').href as string | undefined;
    const url = window.prompt('Link URL', previous || 'https://');
    if (url === null) return;
    const trimmed = url.trim();
    if (!trimmed) {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: trimmed }).run();
  }

  function applyColor(color: string) {
    if (!editor) return;
    // Prefer Color command; fall back to textStyle mark (TipTap v3).
    const chain = editor.chain().focus();
    if (typeof editor.commands.setColor === 'function') {
      chain.setColor(color).run();
      return;
    }
    chain.setMark('textStyle', { color }).run();
  }

  function clearColor() {
    if (!editor) return;
    const chain = editor.chain().focus();
    if (typeof editor.commands.unsetColor === 'function') {
      chain.unsetColor().run();
      return;
    }
    chain.setMark('textStyle', { color: null }).removeEmptyTextStyle().run();
  }

  const activeColor = (editor?.getAttributes('textStyle').color as string | undefined) || '';

  return (
    <div className="admin-field admin-rte">
      <label>{label}</label>
      <div className={`admin-rte-shell${compact ? ' admin-rte-shell--compact' : ''}`}>
        <div className="admin-rte-toolbar" role="toolbar" aria-label={`${label} formatting`}>
          <ToolbarButton
            label="Bold"
            active={editor?.isActive('bold')}
            onClick={() => editor?.chain().focus().toggleBold().run()}
          >
            <strong>B</strong>
          </ToolbarButton>
          <ToolbarButton
            label="Italic"
            active={editor?.isActive('italic')}
            onClick={() => editor?.chain().focus().toggleItalic().run()}
          >
            <em>I</em>
          </ToolbarButton>
          <ToolbarButton
            label="Underline"
            active={editor?.isActive('underline')}
            onClick={() => editor?.chain().focus().toggleUnderline().run()}
          >
            <span className="admin-rte-u">U</span>
          </ToolbarButton>
          <ToolbarButton label="Link" active={editor?.isActive('link')} onClick={setLink}>
            Link
          </ToolbarButton>

          <span className="admin-rte-sep" aria-hidden="true" />
          <span className="admin-rte-color-label" aria-hidden="true">
            Color
          </span>
          {RTE_TEXT_COLORS.map((c) => (
            <ToolbarButton
              key={c.id}
              label={`${c.label} text`}
              active={activeColor.toLowerCase() === c.value.toLowerCase()}
              className="admin-rte-color-btn"
              onClick={() => applyColor(c.value)}
            >
              <span className={`admin-rte-swatch admin-rte-swatch--${c.id}`} style={{ background: c.value }} />
            </ToolbarButton>
          ))}
          <ToolbarButton label="Remove text color" onClick={clearColor}>
            Default
          </ToolbarButton>

          {!compact ? (
            <>
              <span className="admin-rte-sep" aria-hidden="true" />
              <ToolbarButton
                label="Title (this paragraph only)"
                active={editor?.isActive('heading', { level: 2 })}
                onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
              >
                Title
              </ToolbarButton>
              <ToolbarButton
                label="Subtitle (this paragraph only)"
                active={editor?.isActive('heading', { level: 3 })}
                onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
              >
                Sub
              </ToolbarButton>
              <ToolbarButton
                label="Normal text"
                active={editor?.isActive('paragraph') && !editor?.isActive('heading')}
                onClick={() => editor?.chain().focus().setParagraph().run()}
              >
                Text
              </ToolbarButton>
              <span className="admin-rte-sep" aria-hidden="true" />
              <ToolbarButton
                label="Bullet list"
                active={editor?.isActive('bulletList')}
                onClick={() => editor?.chain().focus().toggleBulletList().run()}
              >
                • List
              </ToolbarButton>
              <ToolbarButton
                label="Numbered list"
                active={editor?.isActive('orderedList')}
                onClick={() => editor?.chain().focus().toggleOrderedList().run()}
              >
                1. List
              </ToolbarButton>
            </>
          ) : null}
          <span className="admin-rte-sep" aria-hidden="true" />
          <ToolbarButton
            label="Clear formatting"
            onClick={() => editor?.chain().focus().unsetAllMarks().clearNodes().run()}
          >
            Clear
          </ToolbarButton>
        </div>
        <EditorContent editor={editor} />
      </div>
      <p className="hint">
        Select text → pick <strong>Yellow / White / Black / Red</strong> (selected words only).{' '}
        {!compact ? (
          <>
            <strong>Enter</strong> = paragraph · <strong>Title / Sub</strong> = size · <strong>B</strong> = bold
          </>
        ) : (
          <>
            <strong>B</strong> = bold · <strong>Default</strong> = remove color
          </>
        )}
      </p>
    </div>
  );
}
