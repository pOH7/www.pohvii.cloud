"use client";

import React from "react";
import { Check, Code2, Copy } from "lucide-react";
import type { SimpleIcon } from "simple-icons";
import {
  siC,
  siCplusplus,
  siCss,
  siDocker,
  siDotnet,
  siGo,
  siGnubash,
  siHtml5,
  siJavascript,
  siJson,
  siKotlin,
  siLua,
  siMarkdown,
  siMysql,
  siNginx,
  siNodedotjs,
  siOpenjdk,
  siPhp,
  siPostgresql,
  siPython,
  siR,
  siReact,
  siRuby,
  siRust,
  siSwift,
  siTypescript,
  siXml,
  siYaml,
  siZsh,
} from "simple-icons";
import MermaidDiagram from "./MermaidDiagram";

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

type CopyCodeButtonProps = {
  onCopy: () => Promise<boolean>;
};

const LANGUAGE_ICONS: Partial<Record<string, SimpleIcon>> = {
  bash: siGnubash,
  c: siC,
  "c#": siDotnet,
  "c++": siCplusplus,
  cpp: siCplusplus,
  cs: siDotnet,
  css: siCss,
  docker: siDocker,
  dockerfile: siDocker,
  go: siGo,
  golang: siGo,
  html: siHtml5,
  java: siOpenjdk,
  javascript: siJavascript,
  js: siJavascript,
  json: siJson,
  jsx: siReact,
  kotlin: siKotlin,
  lua: siLua,
  markdown: siMarkdown,
  md: siMarkdown,
  mdx: siMarkdown,
  mysql: siMysql,
  nginx: siNginx,
  node: siNodedotjs,
  "node.js": siNodedotjs,
  nodejs: siNodedotjs,
  php: siPhp,
  postgres: siPostgresql,
  postgresql: siPostgresql,
  py: siPython,
  python: siPython,
  r: siR,
  rb: siRuby,
  react: siReact,
  ruby: siRuby,
  rs: siRust,
  rust: siRust,
  sh: siGnubash,
  shell: siGnubash,
  sql: siPostgresql,
  swift: siSwift,
  ts: siTypescript,
  tsx: siReact,
  typescript: siTypescript,
  xml: siXml,
  yaml: siYaml,
  yml: siYaml,
  zsh: siZsh,
};

function LanguageIcon({ language }: { language: string }) {
  const icon = LANGUAGE_ICONS[language];
  if (!icon) {
    return <Code2 className="size-3.5 shrink-0" aria-hidden="true" />;
  }

  const hex = icon.hex.toLowerCase();
  const fill =
    hex === "000000" || hex === "ffffff" ? "currentColor" : `#${icon.hex}`;

  return (
    <svg
      viewBox="0 0 24 24"
      className="size-3.5 shrink-0"
      aria-hidden="true"
      focusable="false"
    >
      <path d={icon.path} fill={fill} />
    </svg>
  );
}

function CopyCodeButton({ onCopy }: CopyCodeButtonProps) {
  const [copied, setCopied] = React.useState(false);
  const timeoutRef = React.useRef<number | undefined>(undefined);

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current !== undefined) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleCopy = React.useCallback(async () => {
    const didCopy = await onCopy();
    if (!didCopy) return;
    setCopied(true);
    if (timeoutRef.current !== undefined) {
      window.clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = window.setTimeout(() => setCopied(false), 1500);
  }, [onCopy]);

  return (
    <button
      type="button"
      onClick={() => void handleCopy()}
      aria-label="Copy code"
      className="border-border bg-background text-foreground hover:bg-muted inline-flex cursor-pointer items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs transition-colors"
    >
      {copied ? (
        <Check className="size-3.5" aria-hidden="true" />
      ) : (
        <Copy className="size-3.5" aria-hidden="true" />
      )}
      <span>{copied ? "Copied" : "Copy"}</span>
    </button>
  );
}

export default function CodeBlock(props: PreProps) {
  const { children, className = "", ...rest } = props;

  // Attempt to extract raw text content from the nested code element
  // MDX typically renders code blocks as: <pre><code class="language-xxx">...</code></pre>
  let codeText = "";
  let language: string | undefined;

  if (React.isValidElement(children)) {
    const child = children as React.ReactElement<DataProps>;
    const raw = child.props.children;
    const cls: string | undefined = child.props.className || child.props.class;
    const dataLang: string | undefined = child.props["data-language"];
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
        const nodeCls: string | undefined = n.props.className || n.props.class;
        const isLine =
          (typeof nodeCls === "string" && /(^|\s)line(\s|$)/.test(nodeCls)) ||
          n.props["data-line"] !== undefined;
        const text = getText(n.props.children);
        return isLine ? (text ? text + "\n" : "\n") : text;
      }
      return "";
    };
    codeText = getText(raw).replace(/\s+$/g, "");
  }

  const preRef = React.useRef<HTMLPreElement>(null);

  const onCopy = React.useCallback(async (): Promise<boolean> => {
    const pre = preRef.current;
    const code = pre?.querySelector("code");
    let text = codeText;
    if (code) {
      const lines = code.querySelectorAll("[data-line]");
      if (lines.length > 0) {
        const collected: string[] = [];
        lines.forEach((ln) => {
          // use textContent (line numbers are in ::before so not included)
          collected.push((ln.textContent || "").replace(/\u00A0/g, " "));
        });
        text = collected.join("\n").replace(/\s+$/g, "");
      } else {
        text = (code.textContent || codeText).replace(/\s+$/g, "");
      }
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if ("clipboard" in navigator && navigator.clipboard) {
        await navigator.clipboard.writeText(text);
      } else {
        throw new Error("clipboard API not available");
      }
      return true;
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
        return true;
      } catch {
        return false;
      }
    }
  }, [codeText]);

  // Check if this is a Mermaid diagram
  if (language === "mermaid") {
    return <MermaidDiagram chart={codeText} />;
  }

  const languageLabel = (language ?? "text").trim().toLowerCase();

  return (
    <div
      data-mdx-code-block
      className="group border-border bg-muted overflow-hidden rounded-lg border"
    >
      <div className="border-border bg-background/80 flex items-center justify-between border-b px-3 py-2">
        <span className="text-muted-foreground inline-flex items-center gap-1.5 text-[11px] tracking-wider uppercase">
          <LanguageIcon language={languageLabel} />
          {languageLabel}
        </span>
        <CopyCodeButton onCopy={onCopy} />
      </div>

      <pre
        ref={preRef}
        {...rest}
        className={`max-h-[60vh] overflow-auto p-4 ${className}`.trim()}
      >
        {children}
      </pre>
    </div>
  );
}
