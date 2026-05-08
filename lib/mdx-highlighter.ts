import {
  createHighlighter,
  createJavaScriptRegexEngine,
  type BundledLanguage,
  type BundledHighlighterOptions,
  type BundledTheme,
  type Highlighter,
} from "shiki";

export function getWorkerSafeHighlighter(
  options: BundledHighlighterOptions<BundledLanguage, BundledTheme>
): Promise<Highlighter> {
  return createHighlighter({
    ...options,
    engine: createJavaScriptRegexEngine(),
  });
}
