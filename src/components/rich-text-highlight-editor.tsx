import { useEffect, useRef } from 'react';
import { Highlighter, RemoveFormatting } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface RichTextHighlightEditorProps {
  value: string;
  onChange: (value: string) => void;
}

/**
 * Small, dependency-free editor for the hero headline. The browser's native
 * selection API keeps highlighting precise while the stored markup stays easy
 * to move between the CMS and homepage.
 */
export function RichTextHighlightEditor({ value, onChange }: RichTextHighlightEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  const runCommand = (command: string, argument?: string) => {
    editorRef.current?.focus();
    document.execCommand(command, false, argument);
    onChange(editorRef.current?.innerHTML || '');
  };

  return (
    <div className="rounded-lg border border-input bg-background overflow-hidden">
      <div className="flex items-center gap-2 border-b border-border bg-muted/20 p-2">
        <Button
          type="button"
          size="sm"
          variant="outline"
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => runCommand('backColor', 'rgba(124, 58, 237, 0.28)')}
        >
          <Highlighter className="mr-2 h-4 w-4 text-primary" /> Highlight selection
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => runCommand('removeFormat')}
        >
          <RemoveFormatting className="mr-2 h-4 w-4" /> Clear formatting
        </Button>
      </div>
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={(event) => onChange(event.currentTarget.innerHTML)}
        className="hero-editor min-h-28 whitespace-pre-wrap px-4 py-3 text-2xl font-semibold leading-tight outline-none"
        aria-label="Hero headline rich text editor"
      />
      <p className="border-t border-border px-4 py-2 text-xs text-muted-foreground">
        Select any words, then choose Highlight selection. Use Shift + Enter for a new line.
      </p>
    </div>
  );
}

export function normalizeHeroHeadline(value: string, secondLine?: string) {
  if (/<[a-z][\s\S]*>/i.test(value)) return value;
  return `${value || 'Design & Growth'}${secondLine ? `<br />${secondLine}` : ''}`;
}