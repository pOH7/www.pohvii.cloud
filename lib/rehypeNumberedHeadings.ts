// Minimal rehype plugin to prefix headings (H2–H4) with hierarchical numbers
// e.g., H2 -> 1., H3 -> 1.1, H4 -> 1.1.1
// No external deps; simple recursive walk over HAST tree.

// Using loose types to avoid requiring external @types/hast
interface HastNode {
  type: string;
  tagName?: string;
  children?: HastNode[];
  value?: string;
}

function isElement(node: HastNode): node is HastNode {
  return node && node.type === "element";
}

function isHeading(node: HastNode) {
  return (
    node.tagName === "h2" || node.tagName === "h3" || node.tagName === "h4"
  );
}

function createText(value: string): HastNode {
  return { type: "text", value };
}

export default function rehypeNumberedHeadings() {
  const counters = [0, 0, 0, 0, 0, 0]; // h1..h6 (we'll use h2..h4)

  function numberForLevel(level: number) {
    const idx = level - 1;
    counters[idx] += 1;
    for (let i = idx + 1; i < counters.length; i++) counters[i] = 0;

    // Build from H2 (index 1) down to current
    const parts: number[] = [];
    for (let i = 1; i <= idx; i++) {
      if (counters[i] === 0) parts.push(0);
      else parts.push(counters[i]);
    }
    return parts.join(".") + ". ";
  }

  function visit(node: HastNode) {
    if (!isElement(node)) return;

    if (isHeading(node)) {
      const level = parseInt(node.tagName![1], 10);
      const prefix = numberForLevel(level);

      // Avoid double-numbering if author already included a numeric prefix
      const firstChild = node.children?.[0];
      const firstText =
        firstChild && firstChild.type === "text"
          ? (firstChild.value || "").trim()
          : "";
      const seemsNumbered = /^\d+(?:\.\d+)*\.?\s/.test(firstText);

      if (!seemsNumbered) {
        node.children = [createText(prefix), ...(node.children || [])];
      }
    }

    // Recurse
    const children = node.children || [];
    for (const child of children) visit(child);
  }

  return function transformer(tree: HastNode) {
    visit(tree);
  };
}
