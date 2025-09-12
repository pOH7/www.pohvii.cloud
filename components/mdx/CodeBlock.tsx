"use client";

import React from "react";

type DataProps = {
  children?: React.ReactNode;
  className?: string;
  class?: string;
  "data-language"?: string;
  "data-line"?: string | boolean;
};

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
    const child = children as React.ReactElement<DataProps>;
    const raw = child?.props?.children;
    const cls: string | undefined =
      child?.props?.className || child?.props?.class;
    const dataLang: string | undefined = child?.props?.["data-language"];
    if (typeof dataLang === "string" && dataLang.trim()) {
      language = dataLang;
    } else if (typeof cls === "string") {
      const match = cls.match(/language-([\w-]+)/);
      language = match?.[1];
    }

    // Recursively extract visible text content. Handle rehype-pretty-code
    // which wraps lines in <span class="line">...</span>.
    const getText = (node: React.ReactNode): string => {
      if (typeof node === "string") return node;
      if (Array.isArray(node)) return node.map(getText).join("");
      if (React.isValidElement(node)) {
        const n = node as React.ReactElement<DataProps>;
        const nodeCls: string | undefined =
          n.props?.className || n.props?.class;
        const isLine =
          (typeof nodeCls === "string" && /(^|\s)line(\s|$)/.test(nodeCls)) ||
          n.props?.["data-line"] !== undefined;
        const text = getText(n.props?.children);
        return isLine ? (text ? text + "\n" : "\n") : text;
      }
      return "";
    };
    codeText = getText(raw).replace(/\s+$/g, "");
  }

  const [copied, setCopied] = React.useState(false);
  const preRef = React.useRef<HTMLPreElement>(null);

  const extractTextFromDom = (): string => {
    const pre = preRef.current;
    if (!pre) return codeText;
    const code = pre.querySelector("code");
    if (!code) return codeText;
    const lines = code.querySelectorAll("[data-line]");
    if (lines.length > 0) {
      const collected: string[] = [];
      lines.forEach((ln) => {
        // use textContent (line numbers are in ::before so not included)
        collected.push((ln.textContent || "").replace(/\u00A0/g, " "));
      });
      return collected.join("\n").replace(/\s+$/g, "");
    }
    return (code.textContent || codeText).replace(/\s+$/g, "");
  };

  const onCopy = async () => {
    const text = extractTextFromDom();
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        throw new Error("clipboard API not available");
      }
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      // Fallback for older browsers or denied permissions
      try {
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.setAttribute("readonly", "");
        ta.style.position = "absolute";
        ta.style.left = "-9999px";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1500);
      } catch {
        // noop
      }
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
        ref={preRef}
        {...rest}
        className={`overflow-auto max-h-[60vh] rounded-lg bg-muted p-4 pr-12 ${className}`.trim()}
      >
        {children}
      </pre>
    </div>
  );
}
