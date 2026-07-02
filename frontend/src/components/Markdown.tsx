import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";

/** Markdown renderer themed for CyberAce (lessons + challenge prompts). */
export function Markdown({ children, className }: { children: string; className?: string }) {
  return (
    <div className={cn("space-y-4 text-[15px] leading-relaxed text-muted", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h2: ({ children }) => (
            <h2 className="mt-8 font-display text-xl font-semibold text-fg first:mt-0">{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 className="mt-6 font-display text-lg font-semibold text-primary">{children}</h3>
          ),
          p: ({ children }) => <p className="text-muted">{children}</p>,
          strong: ({ children }) => <strong className="font-semibold text-fg">{children}</strong>,
          a: ({ children, href }) => (
            <a href={href} className="text-primary underline decoration-primary/40 underline-offset-2">
              {children}
            </a>
          ),
          ul: ({ children }) => <ul className="list-disc space-y-1.5 pl-5 marker:text-primary">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal space-y-1.5 pl-5 marker:text-primary">{children}</ol>,
          li: ({ children }) => <li className="text-muted">{children}</li>,
          blockquote: ({ children }) => (
            <blockquote className="border-l-2 border-primary/50 bg-primary/5 px-4 py-2 text-sm text-muted">
              {children}
            </blockquote>
          ),
          code: ({ className, children }) => {
            const isBlock = /language-/.test(className || "");
            if (isBlock) return <code className="font-mono text-sm text-primary">{children}</code>;
            return (
              <code className="rounded bg-surface-2 px-1.5 py-0.5 font-mono text-[0.85em] text-primary">
                {children}
              </code>
            );
          },
          pre: ({ children }) => (
            <pre className="overflow-x-auto rounded-xl border border-line bg-surface-2 p-4 font-mono text-sm leading-relaxed text-fg">
              {children}
            </pre>
          ),
          table: ({ children }) => (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">{children}</table>
            </div>
          ),
          thead: ({ children }) => <thead className="text-left text-fg">{children}</thead>,
          th: ({ children }) => (
            <th className="border-b border-line px-3 py-2 font-display font-semibold">{children}</th>
          ),
          td: ({ children }) => <td className="border-b border-line/60 px-3 py-2 text-muted">{children}</td>,
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
