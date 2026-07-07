"use client";

import { useMemo, useRef } from "react";
import type { CodeLanguage } from "@/lib/types";

/**
 * Lightweight code editor: a transparent <textarea> perfectly overlaid on a
 * highlighted <pre>. No heavy dependency, works for pseudo-code CyberAce and C.
 */

const PSEUDO_KEYWORDS = [
  "Algorithme", "Var", "Const", "Type", "Debut", "Début", "Fin", "Si", "Alors", "Sinon", "Fsi", "FinSi",
  "Tantque", "TantQue", "Fait", "FinTantque", "Pour", "allant", "de", "à", "a", "pas", "Fpour", "FinPour",
  "Repeter", "Répéter", "Jusqua", "Jusqu'à", "Lire", "Ecrire", "Écrire", "Fonction", "Procedure", "Procédure",
  "retourner", "Retourner", "Tableau", "entier", "reel", "réel", "caractere", "caractère", "chaine", "chaîne",
  "booleen", "booléen", "vrai", "faux", "et", "ou", "non", "div", "mod", "NIL", "Allouer", "Liberer", "Libérer",
];

const C_KEYWORDS = [
  "int", "char", "float", "double", "void", "long", "short", "unsigned", "signed", "const",
  "if", "else", "while", "for", "do", "switch", "case", "default", "break", "continue", "return",
  "struct", "typedef", "union", "enum", "sizeof", "static", "extern", "goto",
  "malloc", "calloc", "realloc", "free", "printf", "scanf", "include", "define", "NULL", "main",
];

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function highlight(code: string, language: CodeLanguage): string {
  let html = escapeHtml(code);

  // strings first so keywords inside them stay untouched
  html = html.replace(/(&quot;|")([^"\n]*)(&quot;|")/g, '<span class="tok-str">"$2"</span>');
  html = html.replace(/'([^'\n]{0,3})'/g, "<span class=\"tok-str\">'$1'</span>");

  // comments
  if (language === "c") {
    html = html.replace(/(\/\/[^\n]*)/g, '<span class="tok-com">$1</span>');
    html = html.replace(/(\/\*[\s\S]*?\*\/)/g, '<span class="tok-com">$1</span>');
    html = html.replace(/(^|\n)(\s*#\s*\w+[^\n]*)/g, '$1<span class="tok-pre">$2</span>');
  } else {
    html = html.replace(/(\{[^{}\n]*\})/g, '<span class="tok-com">$1</span>');
    html = html.replace(/(\/\/[^\n]*)/g, '<span class="tok-com">$1</span>');
  }

  // numbers
  html = html.replace(/\b(\d+(?:\.\d+)?)\b/g, '<span class="tok-num">$1</span>');

  // keywords (word-boundary, accent-aware manual list)
  const kws = language === "c" ? C_KEYWORDS : PSEUDO_KEYWORDS;
  const escaped = kws
    .slice()
    .sort((a, b) => b.length - a.length)
    .map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .join("|");
  html = html.replace(
    new RegExp(`(?<![\\w&;])(${escaped})(?![\\w])`, "g"),
    '<span class="tok-kw">$1</span>'
  );

  // assignment arrow — the star of pseudo-code
  html = html.replace(/←|&lt;-/g, '<span class="tok-arrow">←</span>');

  return html;
}

export function CodeEditor({
  language,
  value,
  onChange,
  minRows = 12,
  readOnly = false,
}: {
  language: CodeLanguage;
  value: string;
  onChange: (v: string) => void;
  minRows?: number;
  readOnly?: boolean;
}) {
  const preRef = useRef<HTMLPreElement>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);

  const html = useMemo(() => highlight(value, language) + "\n", [value, language]);
  const lines = Math.max(minRows, value.split("\n").length);
  const lineNumbers = useMemo(
    () => Array.from({ length: lines }, (_, i) => i + 1).join("\n"),
    [lines]
  );

  const syncScroll = () => {
    if (preRef.current && taRef.current) {
      preRef.current.scrollTop = taRef.current.scrollTop;
      preRef.current.scrollLeft = taRef.current.scrollLeft;
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const ta = e.currentTarget;
      const { selectionStart: s, selectionEnd: en } = ta;
      const next = value.slice(0, s) + "  " + value.slice(en);
      onChange(next);
      requestAnimationFrame(() => {
        ta.selectionStart = ta.selectionEnd = s + 2;
      });
    }
  };

  return (
    <div className="code-editor" data-lang={language}>
      <div className="code-editor-gutter" aria-hidden="true">
        <pre>{lineNumbers}</pre>
      </div>
      <div className="code-editor-body">
        <pre ref={preRef} aria-hidden="true" className="code-editor-highlight">
          <code dangerouslySetInnerHTML={{ __html: html }} />
        </pre>
        <textarea
          ref={taRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onScroll={syncScroll}
          onKeyDown={onKeyDown}
          spellCheck={false}
          autoCapitalize="off"
          autoComplete="off"
          autoCorrect="off"
          readOnly={readOnly}
          rows={lines}
          aria-label={language === "c" ? "Éditeur de code C" : "Éditeur de pseudo-code"}
          placeholder={
            language === "c"
              ? "// Écris ton programme C ici…"
              : "Algorithme MonAlgo\nVar …\nDebut\n  …\nFin"
          }
        />
      </div>
    </div>
  );
}
