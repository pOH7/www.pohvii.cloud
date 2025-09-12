"use client";

import React from "react";

type PreProps = React.ComponentProps<"pre"> & {
  children: React.ReactNode;
};

export default function CodeBlock(props: PreProps) {
  const { children, className = "", ...rest } = props;

  // Attempt to extract raw text content from the nested code element
  // MDX typically renders code blocks as: <pre><code class="language-xxx">...</code></pre>
  let codeText = "";
  let language: string | undefined;

  if (React.isValidElement(children)) {
    const child = children as React.ReactElement<{
      children?: React.ReactNode;
      className?: string;
      class?: string;
    }>;
    const raw = child?.props?.children;
    const cls: string | undefined =
      child?.props?.className || child?.props?.class;
    if (typeof cls === "string") {
      const match = cls.match(/language-([\w-]+)/);
      language = match?.[1];
    }

    if (typeof raw === "string") {
      codeText = raw;
    } else if (Array.isArray(raw)) {
      codeText = raw.join("");
    }
  }

  const [copied, setCopied] = React.useState(false);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(codeText);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      // noop
    }
  };

  return (
    <div className="relative group">
      {/* Copy button */}
      <button
        type="button"
        onClick={onCopy}
        aria-label="Copy code"
        className="absolute top-2 right-2 z-10 rounded-md border border-border bg-background/80 backdrop-blur px-2 py-1 text-xs text-foreground shadow-sm transition-opacity opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100 hover:bg-muted"
      >
        {copied ? "Copied" : "Copy"}
      </button>

      {/* Optional language badge */}
      {language ? (
        <span className="pointer-events-none absolute left-2 top-2 z-10 select-none rounded-md bg-background/80 backdrop-blur px-2 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground border border-border opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100 transition-opacity">
          {language}
        </span>
      ) : null}

      <pre
        {...rest}
        className={`overflow-auto max-h-[60vh] rounded-lg bg-muted p-4 pr-12 ${className}`.trim()}
      >
        {children}
      </pre>
    </div>
  );
}
